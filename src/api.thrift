enum UserType {
	QQ = 0;
	Weixin = 1;
}

struct User{
	1: required string userId;
	2: required UserType type;
	3: required string nickname;
	4: optional string email;
}

struct UserQuery{
	1: string userId;
	2: UserType type;
}

service UserStore{
	void add(1: User user);
	User query(1: UserQuery terms);
}
