package app

import (
	"os"
    "path"
	"io/ioutil"
	"encoding/json"
)

type Schema struct {
	Db string
	Collection string
	Fields []Field
}

type Field struct {
	Key string
	Value string
}

var Config []Schema
var Cwd string

func init() {
	Cwd, _ := os.Getwd()

	bytes, _ := ioutil.ReadFile(path.Join(Cwd, "conf/schema.json"))
	err := json.Unmarshal(bytes, &Config)
	if err != nil{
		panic("Can't read config")
	}
}

func GetPublicDir() string {
	return path.Join(Cwd, "public")
}
