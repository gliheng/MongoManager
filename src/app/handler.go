package app

type RPCService struct {}

type StringList struct {
	Result *[]string
}

type GenericList struct {
	Result *[]interface{}
}

func (h *RPCService) GetDBs(args *interface{}, ret *StringList) error {
	data, _ := GetDBs()
	ret.Result = &data
    return nil
}

func (h *RPCService) GetCollections(args *interface{}, ret *StringList) error {
	args2 := (*args).(map[string]interface{})
	dbname := args2["dbname"].(string)

	data, _ := GetCollections(dbname)
	ret.Result = &data
    return nil
}

func (h *RPCService) GetCollectionData(args *interface{}, ret *GenericList) error {
	args2 := (*args).(map[string]interface{})
	dbname := args2["dbname"].(string)
	cname := args2["cname"].(string)

	data, _ := GetCollectionData(dbname, cname)
	ret.Result = &data
    return nil
}
