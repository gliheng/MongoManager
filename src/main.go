package main

import (
    "net/http"
    "log"
    "fmt"
    "github.com/gorilla/rpc"
    "github.com/gorilla/rpc/json"
    "./app"
)

var (
	PORT string = "8000"
)

func main() {
	// json rpc service
    serv := rpc.NewServer()
    serv.RegisterCodec(json.NewCodec(), "application/json")
    serv.RegisterTCPService(new(app.RPCService), "")
    http.Handle("/rpc", serv)

	// static files
	http.Handle("/", http.FileServer(http.Dir(app.GetPublicDir())))

	fmt.Println("Server running on port", PORT)
	err := http.ListenAndServe(":" + PORT, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
