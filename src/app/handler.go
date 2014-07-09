package app

import (
	"encoding/json"
)

type RPCService struct {}

type GenericObject struct {
	Data *Anything
}

type Anything interface{}

func (h *RPCService) GetDBs(args *interface{}, ret *GenericObject) error {
	data, _ := GetDBs()
	converted := Anything(data)
	ret.Data = &converted
    return nil
}

func (h *RPCService) GetCollections(args *interface{}, ret *GenericObject) error {
	args2 := (*args).(map[string]interface{})
	dbname := args2["dbname"].(string)

	data, _ := GetCollections(dbname)
	converted := Anything(data)
	ret.Data = &converted
    return nil
}

func (h *RPCService) GetCollectionData(args *interface{}, ret *GenericObject) error {
	args2 := (*args).(map[string]interface{})
	dbname := args2["dbname"].(string)
	cname := args2["cname"].(string)

	data, _ := GetCollectionData(dbname, cname)
	converted := Anything(data)
	ret.Data = &converted
    return nil
}

// TODO
// func (h *RPCService) InsertRecord(args *interface{}, ret *int) error {
// use *int only return 0, how do I return 1?
func (h *RPCService) InsertRecord(args *interface{}, ret *int) error {
	args2 := (*args).(map[string]interface{})
	dbname := args2["dbname"].(string)
	cname := args2["cname"].(string)
	data := args2["data"].(string)

	var parsed interface{}
	json.Unmarshal([]byte(data), &parsed)

	return InsertRecord(dbname, cname, &parsed)
}

func (h *RPCService) GetSchema(args *interface{}, ret *GenericObject) error {
	args2 := (*args).(map[string]interface{})
	dbname := args2["dbname"].(string)
	cname := args2["cname"].(string)

	for _, s := range Config{
		if s.Db == dbname && s.Collection == cname{
			data := Anything(s.Fields)
			ret.Data = &data
			return nil
		}
	}

	return nil
}
