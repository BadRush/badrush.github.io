# ====================================================================
# BUILD STAGE
# ====================================================================
FROM golang:alpine AS builder

WORKDIR /app

# Salin modul dan source code
COPY go.mod ./
COPY main.go ./

# Kompilasi binary statis Go tanpa dependensi CGO
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o counter-service main.go

# ====================================================================
# FINAL RUNTIME STAGE (Ultra-lightweight ~12MB)
# ====================================================================
FROM alpine:latest

WORKDIR /app

# Tambahkan sertifikat SSL & data timezone
RUN apk --no-cache add ca-certificates tzdata

# Salin binary dari stage builder
COPY --from=builder /app/counter-service .

# Port default counter
EXPOSE 8080

# Direktori mount data volume
VOLUME ["/data"]

CMD ["./counter-service"]
