package main

import (
    "os"
    "log"
    "fmt"
    "time"
    "net/http"
    "code.google.com/p/go.net/websocket"
)

const (
    listenAddr = ":8080" // server address
)

var (
    pwd, _        = os.Getwd()
//   RootTemp      = template.Must(template.ParseFiles(pwd + "/chat.html"))
    JSON          = websocket.JSON           // codec for JSON
    Message       = websocket.Message        // codec for string, []byte
    ActiveClients = make(map[ClientConn]int) // map containing clients
)

type ClientConn struct {
    websocket *websocket.Conn
    clientIP  string
}

func init() {
    http.Handle("/", http.FileServer(http.Dir("./")))
    http.Handle("/socket", websocket.Handler(websocket.Handler(handler)))
}


func main() {
    http.ListenAndServe(listenAddr, nil)
    log.Println("Everything running smoothly")
    for {
        time.Sleep(time.Second*5)
    }
}

func handler(ws *websocket.Conn) {
    var err error
    var clientMessage string
    // use []byte if websocket binary type is blob or arraybuffer
    // var clientMessage []byte

    // cleanup on server side
    defer func() {
            if err = ws.Close(); err != nil {
                    log.Println("Websocket could not be closed", err.Error())
            }
    }()

    client := ws.Request().RemoteAddr
    log.Println("Client connected:", client)
    sockCli := ClientConn{ws, client}
    ActiveClients[sockCli] = 0
    log.Println("Number of clients connected ...", len(ActiveClients))

    for {
        if err := Message.Receive(ws, &clientMessage); err != nil {
            // If we cannot Read then the connection is closed
            log.Println("Websocket Disconnected waiting", err.Error())
            // remove the ws client conn from our active clients
            delete(ActiveClients, sockCli)
            log.Println("Number of clients still connected ...", len(ActiveClients))
            return
        }
        clientMessage = sockCli.clientIP + " Said: " + clientMessage
        for cs, _ := range ActiveClients {
            if err = Message.Send(cs.websocket, clientMessage); err != nil {
                // we could not send the message to a peer
                log.Println("Could not send message to ", cs.clientIP, err.Error())
            }
        }
    }
}

func send_msg(ws *websocket.Conn, msg string) {
    fmt.Fprint(ws, msg)
    log.Println("Sent:", msg)
}
