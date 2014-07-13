package app

import (
	"labix.org/v2/mgo"
	"labix.org/v2/mgo/bson"
)

var (
	CONNECTION string = "mongodb://localhost:27017"
	session *mgo.Session
)

func init() {
	_session, err := mgo.Dial(CONNECTION)

	session = _session
	if err != nil {
		panic(err)
	}
	// defer session.Close()
}

func GetDBs() (names []string, err error) {
	return session.DatabaseNames()
}

func GetCollections(dbname string) (names []string, err error) {
	db := session.DB(dbname)
	return db.CollectionNames()
}

func GetCollectionData(dbname string, cname string) (results []interface{}, err error) {
	db := session.DB(dbname)
	err = db.C(cname).Find(bson.M{}).All(&results)
	return
}

func InsertRecord(dbname, cname string, data interface{}) (id bson.ObjectId, err error) {
	db := session.DB(dbname)
	id = bson.NewObjectId()
	mdata := data.(map[string]interface{})
	mdata["_id"] = id
	err = db.C(cname).Insert(mdata)
	return
}

func UpdateRecord(dbname, cname, id string, data *interface{}) (err error) {
	db := session.DB(dbname)
	err = db.C(cname).UpdateId(bson.ObjectIdHex(id), *data)
	return
}

func RemoveRecords(dbname, cname string, data []string) (err error) {
	db := session.DB(dbname)
	for _, id := range data{
		objectId := bson.ObjectIdHex(id)
		err = db.C(cname).RemoveId(objectId)
		if err != nil {
			return
		}
	}
	return
}
