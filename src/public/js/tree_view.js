define([
	'dijit/registry', 'services',
	'dojo/dom', 'dijit/form/Button',
	'dojo/store/Observable', 'dojo/aspect',
	'dojo', 'dojo/topic', "dijit/tree/ObjectStoreModel", "dojo/store/Memory", "dijit/Tree"
], function (
	registry, services,
	dom, Button,
	Observable, aspect,
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


	// To support dynamic data changes, including DnD,
    // the store must support put(child, {parent: parent}).
    // But dojo/store/Memory doesn't, so we have to implement it.
    // Since our store is relational, that just amounts to setting child.parent
    // to the parent's id.
    aspect.around(treeStore, "put", function(originalPut){
        return function(obj, options){
            if(options && options.parent){
                obj.parent = options.parent.id;
            }
            return originalPut.call(treeStore, obj, options);
        }
    });

	treeStore = new Observable(treeStore);

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
	tree.startup();

	var $bar = dom.byId('create_bar');
	new Button({
		iconClass: 'dijitIconNewTask',
		label: 'New DB',
		showLabel: false,
		onClick: function () {
			// TODO: does not work
			var childItem = {
				name: "New child",
				id: Math.random()
			};
			treeStore.put(childItem, {
				parent: tree.get("selectedItems")[0],
				overwrite: true
			});
		}
	}).placeAt($bar);

	new Button({
		iconClass: 'dijitIconDocuments',
		label: 'New Collection',
		showLabel: false,
		onClick: function () {
		}
	}).placeAt($bar);

	return tree;
});
