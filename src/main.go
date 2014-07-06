package main

import (
    "net/http"
    "log"
    "fmt"
    "os"
    "path"
    "github.com/gorilla/rpc"
    "github.com/gorilla/rpc/json"
    "./app"
)

var (
	PORT string = "8000"
)

func main() {
    s := rpc.NewServer()
    s.RegisterCodec(json.NewCodec(), "application/json")
    s.RegisterTCPService(new(app.RPCService), "")

	// json rpc service
    http.Handle("/rpc", s)

	// static files
	cwd, _ := os.Getwd()
	http.Handle("/", http.FileServer(http.Dir(path.Join(cwd, "public"))))

	fmt.Println("Server running on port", PORT)
	err := http.ListenAndServe(":" + PORT, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
