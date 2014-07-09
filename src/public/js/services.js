define(['dojox/rpc/Service', 'dojox/rpc/JsonRPC'], function(Service) {
	return new Service({
		target: "/rpc", // this defines the URL to connect for the services
		transport: "POST", // We will use POST as the transport
		envelope: "JSON-RPC-1.0", // We will use JSON-RPC
		contentType: "application/json",
		SMDVersion: "2.0",
		additionalParameters: true,
		services: {
			"RPCService.GetDBs":{},
			"RPCService.GetCollections":{
				parameters: [{"name": "dbname", 'type': 'string'}]
			},
			"RPCService.GetCollectionData":{
				parameters: [
					{"name": "dbname", 'type': 'string'},
					{"name": "cname", 'type': 'string'}
				]
			},
			"RPCService.InsertRecord":{
				parameters: [
					{"name": "dbname", 'type': 'string'},
					{"name": "cname", 'type': 'string'},
					{"name": "data", 'type': 'string'},
				]
			},
			"RPCService.GetSchema":{
				parameters: [
					{"name": "dbname", 'type': 'string'},
					{"name": "cname", 'type': 'string'}
				]
			}
		}
	});
});
