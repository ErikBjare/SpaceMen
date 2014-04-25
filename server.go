package main

import (
    "os"
    "log"
//    "fmt"
    "time"
    "encoding/json"
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

func (conn ClientConn) close() {
    // remove the ws client conn from our active clients
    delete(ActiveClients, conn)
    connectedClients()
}

//type ChatMessage struct {
//    User string
//    Text string
//}

type ClientMessage struct {
    User string
    Text string
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

func connectedClients() {
    log.Println("Number of clients connected: ", len(ActiveClients))
}

func handler(ws *websocket.Conn) {
    var recv string
    // use []byte if websocket binary type is blob or arraybuffer
    //var byteMessage []byte
    var clientMessage ClientMessage

    // cleanup on server side
    defer func() {
        if err := ws.Close(); err != nil {
            log.Println("Websocket could not be closed", err.Error())
        }
    }()

    conn := ClientConn{ws, ws.Request().RemoteAddr}
    ActiveClients[conn] = 0
    
    connectedMsg := "Client connected: " + conn.clientIP
    log.Println(connectedMsg)
    send_msg(ws, ClientMessage{"Server", connectedMsg})
    connectedClients()

    for {
        if err := Message.Receive(ws, &recv); err != nil {
            // If we cannot Read then the connection is closed
            log.Println("Websocket Disconnected waiting", err.Error())
            conn.close()
            return
        }
        err := json.Unmarshal([]byte(recv), &clientMessage)
        if err != nil {
            log.Println("Error when trying to pack up JSON")
            conn.close()
            return
        }
        send_msg(ws, clientMessage)
    }
}

func send_msg(ws *websocket.Conn, msg ClientMessage) {
    b, err := json.Marshal(msg);
    log.Println(string(b));
    if err != nil {
        log.Println("Error when trying to JSONify message")
        return
    }
    for cs, _ := range ActiveClients {
        if err := Message.Send(cs.websocket, string(b)); err != nil {
            // we could not send the message to a peer
            log.Println("Could not send message to ", cs.clientIP, err.Error())
        }
    }
}
