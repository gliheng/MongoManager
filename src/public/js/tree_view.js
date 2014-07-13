define([
	'services',
	'dojo', 'dojo/topic', "dijit/tree/ObjectStoreModel", "dojo/store/Memory", "dijit/Tree"
], function (
	services,
	dojo, topic, ObjectStoreModel, Memory, Tree
) {
	var data = {
		"id": "root",
		"name": "root",
		"parent": null,
		"children": true
	};

	var treeStore = new Memory({
		data: [data],
		getChildren: function(object){
			if (!object.parent) {
				return services.RPCService.GetDBs().then(function (ret) {
					var data = [];
					ret.forEach(function (name) {
						data.push({
							id: name,
							name: name,
							parent: object,
							children: true
						});
					});
					return data;
				});
			} else {
				return services.RPCService.GetCollections({dbname: object.name}).then(function (ret) {
					var data = [];
					ret.forEach(function (name) {
						data.push({
							id: name,
							name: name,
							parent: object
						});
					});
					return data;
				});
			}
		}
	});

	var treeModel = new ObjectStoreModel({
		store: treeStore,
		query: {id: 'root'},
		mayHaveChildren: function(item){
			return "children" in item;
		}
	});

	var tree = new Tree({
		model: treeModel,
		showRoot: false,
		onOpenClick: true,
		onClick: function(item){
			if ('children' in item) return;

			topic.publish('addTab', item.parent.id, item.id);
		}
	}, "tree");

	// tree.startup();

	return tree;
});
