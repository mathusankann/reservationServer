FROM golang

ENV GO111MODULE=on

WORKDIR /app

COPY . .

RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 go build

EXPOSE 80

ENTRYPOINT ["/app/reservationServer"]
