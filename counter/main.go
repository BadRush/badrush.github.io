package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

type CounterData struct {
	Count     int64     `json:"count"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CounterService struct {
	mu         sync.RWMutex
	filePath   string
	data       CounterData
	ipCooldown sync.Mutex
	ipLastSeen map[string]time.Time
	cooldown   time.Duration
}

func NewCounterService(filePath string, defaultBaseline int64, cooldown time.Duration) (*CounterService, error) {
	service := &CounterService{
		filePath:   filePath,
		ipLastSeen: make(map[string]time.Time),
		cooldown:   cooldown,
	}

	// Buat direktori data jika belum ada
	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("gagal membuat direktori data: %w", err)
	}

	// Baca data yang tersimpan atau inisialisasi dengan baseline default
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		service.data = CounterData{
			Count:     defaultBaseline,
			UpdatedAt: time.Now().UTC(),
		}
		if err := service.saveToFileLocked(); err != nil {
			return nil, fmt.Errorf("gagal menyimpan data inisial: %w", err)
		}
		log.Printf("File counter baru dibuat di %s dengan baseline: %d", filePath, defaultBaseline)
	} else {
		bytes, err := os.ReadFile(filePath)
		if err != nil {
			return nil, fmt.Errorf("gagal membaca file counter: %w", err)
		}
		if err := json.Unmarshal(bytes, &service.data); err != nil {
			return nil, fmt.Errorf("gagal parse file counter JSON: %w", err)
		}
		log.Printf("Memuat counter dari %s: total %d pengunjung", filePath, service.data.Count)
	}

	// Background worker: bersihkan entri IP yang sudah kadaluwarsa setiap 5 menit
	go service.startCleanupWorker(5 * time.Minute)

	return service, nil
}

func (s *CounterService) saveToFileLocked() error {
	bytes, err := json.MarshalIndent(s.data, "", "  ")
	if err != nil {
		return err
	}

	// Tulis secara atomik menggunakan file temporer lalu rename
	tmpFile := s.filePath + ".tmp"
	if err := os.WriteFile(tmpFile, bytes, 0644); err != nil {
		return err
	}
	return os.Rename(tmpFile, s.filePath)
}

func (s *CounterService) startCleanupWorker(interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for range ticker.C {
		s.ipCooldown.Lock()
		now := time.Now()
		expiry := s.cooldown * 4 // Hapus IP yang tidak aktif selama 4x masa cooldown
		if expiry < 10*time.Minute {
			expiry = 10 * time.Minute
		}

		for ip, lastSeen := range s.ipLastSeen {
			if now.Sub(lastSeen) > expiry {
				delete(s.ipLastSeen, ip)
			}
		}
		s.ipCooldown.Unlock()
	}
}

func getClientIP(r *http.Request) string {
	// 1. Cloudflare header
	if cfIP := strings.TrimSpace(r.Header.Get("CF-Connecting-IP")); cfIP != "" {
		return cfIP
	}

	// 2. Nginx X-Real-IP
	if realIP := strings.TrimSpace(r.Header.Get("X-Real-IP")); realIP != "" {
		return realIP
	}

	// 3. X-Forwarded-For (ambil IP pertama)
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		ips := strings.Split(xff, ",")
		if len(ips) > 0 {
			ip := strings.TrimSpace(ips[0])
			if ip != "" {
				return ip
			}
		}
	}

	// 4. RemoteAddr fallback
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil && ip != "" {
		return ip
	}

	return r.RemoteAddr
}

func (s *CounterService) RecordVisit(clientIP string) (int64, bool) {
	now := time.Now()

	s.ipCooldown.Lock()
	lastSeen, exists := s.ipLastSeen[clientIP]
	// Cooldown logic: jika belum pernah berkunjung, atau sudah lewat > s.cooldown (30 detik),
	// maka hitungan DITAMBAHKAN (+1).
	shouldIncrement := !exists || now.Sub(lastSeen) > s.cooldown
	if shouldIncrement {
		s.ipLastSeen[clientIP] = now
	}
	s.ipCooldown.Unlock()

	s.mu.Lock()
	defer s.mu.Unlock()

	if shouldIncrement {
		s.data.Count++
		s.data.UpdatedAt = now.UTC()
		if err := s.saveToFileLocked(); err != nil {
			log.Printf("Gagal menyimpan update counter: %v", err)
		}
	}

	return s.data.Count, shouldIncrement
}

func (s *CounterService) GetCurrentCount() int64 {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.data.Count
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dataFile := os.Getenv("DATA_FILE")
	if dataFile == "" {
		dataFile = "/data/counter.json"
	}

	// Cooldown 30 detik per pengunjung
	cooldown := 30 * time.Second

	// Baseline default 24.078
	defaultBaseline := int64(24078)

	service, err := NewCounterService(dataFile, defaultBaseline, cooldown)
	if err != nil {
		log.Fatalf("Gagal inisialisasi counter service: %v", err)
	}

	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	// Visitor counter endpoint
	mux.HandleFunc("/api/visitors", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate")

		switch r.Method {
		case http.MethodGet:
			count := service.GetCurrentCount()
			response := map[string]interface{}{
				"count":     count,
				"increment": false,
			}
			json.NewEncoder(w).Encode(response)

		case http.MethodPost:
			clientIP := getClientIP(r)
			count, incremented := service.RecordVisit(clientIP)
			response := map[string]interface{}{
				"count":     count,
				"increment": incremented,
			}
			json.NewEncoder(w).Encode(response)

		case http.MethodOptions:
			w.Header().Set("Allow", "GET, POST, OPTIONS")
			w.WriteHeader(http.StatusNoContent)

		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
			json.NewEncoder(w).Encode(map[string]string{"error": "Method not allowed"})
		}
	})

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  30 * time.Second,
	}

	log.Printf("Visitor Counter microservice berjalan pada port :%s (cooldown: %v)", port, cooldown)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server berhenti dengan error: %v", err)
	}
}
