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
	Schema interface{}
}

type Field struct {
	Key string
	Value string
}

var Config map[string]interface{}
var DBSchema []Schema
var Cwd string

func init() {
	Cwd, _ := os.Getwd()

	bytes, _ := ioutil.ReadFile(path.Join(Cwd, "conf/schema.json"))
	err := json.Unmarshal(bytes, &Config)
	if err != nil{
		panic("Can't read config")
	}

	dbschema := Config["DBSchema"].([]interface{})
	for _, schema := range dbschema {
		s := schema.(map[string]interface{})
		DBSchema = append(DBSchema, Schema{Db: s["Db"].(string), Collection: s["Collection"].(string), Schema: s["Schema"]});
	}
}

func GetPublicDir() string {
	return path.Join(Cwd, "public")
}
