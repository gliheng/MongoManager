export GOPATH:=$(GOPATH):$(shell pwd)/gen-go
PROJROOT = $(shell pwd)

go:
	@echo "Compiling go server..." 
	go build -o MongoManager .

test:
	go build gen-go/src/api/user_store-remote/user_store-remote.go
	go build gen-go/src/api/calculator-remote/calculator-remote.go
