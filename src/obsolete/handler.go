package app

import (
	"api"
	"net/http"
)


type UserStore struct{
	users map[string] *api.User
}

func NewUserStoreHandler() *UserStore {
	store := UserStore{}
	store.users = make(map[string] *api.User)
	return &store
}

func (self *UserStore) Add(user *api.User) (err error) {
	self.users[user.UserId] = user
	return nil
}

func (self *UserStore) Query(terms *api.UserQuery) (user *api.User, err error) {
	for userId, userObj := range self.users {
		if userId == terms.UserId && userObj.TypeA1 == terms.TypeA1 {
			user = userObj
			return
		}
	}
	err = nil
	return
}
