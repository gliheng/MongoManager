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


