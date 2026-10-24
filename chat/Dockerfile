FROM golang:1.26.4-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /chat ./cmd/chat

FROM alpine:3.19
RUN adduser -D -s /bin/sh appuser
USER appuser
COPY --from=builder /chat /chat
EXPOSE 8090
ENTRYPOINT ["/chat"]
