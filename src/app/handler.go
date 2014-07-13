package app

import (
	"encoding/json"
	"strings"
)

type RPCService struct {}


type Anything interface{}

func (h *RPCService) GetDBs(args *Anything, ret *Anything) error {
	data, _ := GetDBs()
	converted := Anything(data)
	*ret = &converted
    return nil
}

func (h *RPCService) GetCollections(args *Anything, ret *Anything) error {
	args2 := (*args).(map[string]interface{})
	dbname := args2["dbname"].(string)

	data, _ := GetCollections(dbname)
	converted := Anything(data)
	*ret = &converted
    return nil
}

func (h *RPCService) GetCollectionData(args *Anything, ret *Anything) error {
	args2 := (*args).(map[string]interface{})
	dbname := args2["dbname"].(string)
	cname := args2["cname"].(string)

	data, _ := GetCollectionData(dbname, cname)
	converted := Anything(data)
	*ret = &converted
    return nil
}

func (h *RPCService) InsertRecord(args *Anything, ret *string) error {
	args2 := (*args).(map[string]interface{})
	dbname := args2["dbname"].(string)
	cname := args2["cname"].(string)
	data := args2["data"].(string)

	var parsed interface{}
	json.Unmarshal([]byte(data), &parsed)

	// TODO: verify schema
	id, err := InsertRecord(dbname, cname, parsed)

	*ret = id.Hex()
	return err
}

func (h *RPCService) UpdateRecord(args *Anything, ret *int) error {
	args2 := (*args).(map[string]interface{})
	dbname := args2["dbname"].(string)
	cname := args2["cname"].(string)
	id := args2["id"].(string)
	data := args2["data"].(string)

	var parsed interface{}
	json.Unmarshal([]byte(data), &parsed)
	*ret = 0

	// TODO: verify schema
	return UpdateRecord(dbname, cname, id, &parsed)
}

func (h *RPCService) RemoveRecords(args *Anything, ret *int) error {
	args2 := (*args).(map[string]interface{})
	dbname := args2["dbname"].(string)
	cname := args2["cname"].(string)
	data := args2["data"].(string)

	idlist := strings.Split(data, ",")
	// one inserted
	*ret = 0

	// TODO: verify schema
	return RemoveRecords(dbname, cname, idlist)
}

func (h *RPCService) GetSchema(args *Anything, ret *Anything) error {
	args2 := (*args).(map[string]interface{})
	dbname := args2["dbname"].(string)
	cname := args2["cname"].(string)

	for _, s := range Config{
		if s.Db == dbname && s.Collection == cname{
			data := Anything(s.Schema)
			*ret = &data
			return nil
		}
	}

	return nil
}
