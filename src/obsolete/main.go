package main

import (
	"flag"
	"fmt"
	"git.apache.org/thrift.git/lib/go/thrift"
	"os"
	"crypto/tls"
	"./app"
	"api"
)

func Usage() {
	fmt.Fprint(os.Stderr, "Usage of ", os.Args[0], ":\n")
	flag.PrintDefaults()
	fmt.Fprint(os.Stderr, "\n")
}

func main() {
	flag.Usage = Usage
	addr := flag.String("addr", "localhost:9090", "Address to listen to")
	secure := flag.Bool("secure", false, "Use tls secure transport")

	flag.Parse()

	var protocolFactory thrift.TProtocolFactory
	// protocolFactory = thrift.NewTSimpleJSONProtocolFactory()
	protocolFactory = thrift.NewTJSONProtocolFactory()
	// protocolFactory = thrift.NewTCompactProtocolFactory()
	// protocolFactory = thrift.NewTBinaryProtocolFactoryDefault()

	var transportFactory thrift.TTransportFactory
	// transportFactory = thrift.NewTTransportFactory()
	transportFactory = thrift.NewTHttpClientTransportFactory()

	if err := runServer(transportFactory, protocolFactory, *addr, *secure); err != nil {
		fmt.Println("error running server:", err)
	}
}

func runServer(transportFactory thrift.TTransportFactory, protocolFactory thrift.TProtocolFactory, addr string, secure bool) error {
    var transport thrift.TServerTransport
    var err error
    if secure {
        cfg := new(tls.Config)
        if cert, err := tls.LoadX509KeyPair("server.crt", "server.key"); err == nil {
            cfg.Certificates = append(cfg.Certificates, cert)
        } else {
            return err
        }
        transport, err = thrift.NewTSSLServerSocket(addr, cfg)
    } else {
        transport, err = thrift.NewTServerSocket(addr)
    }

    if err != nil {
        return err
    }
    fmt.Printf("%T\n", transport)

    handler := app.NewUserStoreHandler()
    processor := api.NewUserStoreProcessor(handler)
    server := thrift.NewTSimpleServer4(processor, transport, transportFactory, protocolFactory)

    fmt.Println("Starting the simple server... on ", addr)
    return server.Serve()
}

