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
	var data = [{
		"id": "root",
		"name": "root",
		"parent": null,
		"children": true
	}];

	var treeStore = new Memory({
		data: data,
		getChildren: function(object){
			var self = this;
			if (!object.parent) {
				return services.RPCService.GetDBs().then(function (ret) {
					ret = ret || [];
					ret.forEach(function (name) {
						var item = {
							id: 'DB:' + name,
							name: name,
							parent: object.id,
							children: true
						};

						data.push(item);
					});
					return self.query({parent: object.id});
				});
			} else {
				return services.RPCService.GetCollections({dbname: object.name}).then(function (ret) {
					ret = ret || [];
					ret.forEach(function (name) {
						var item = {
							id: 'Collection:' + name,
							name: name,
							parent: object.id
						};

						data.push(item);
					});
					return self.query({parent: object.id});
				});
			}
		}
	});


	// To support dynamic data changes, including DnD,
    // the store must support put(child, {parent: parent}).
    // But dojo/store/Memory doesn't, so we have to implement it.
    // Since our store is relational, that just amounts to setting child.parent
    // to the parent's id.
	/*
    aspect.around(treeStore, "put", function(originalPut){
        return function(obj, options){
            if(options && options.parent){
                obj.parent = options.parent.id;
            }
            return originalPut.call(treeStore, obj, options);
        }
    });
	*/

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

			var parent = treeStore.query({id:item.parent})[0];
			topic.publish('addTab', parent.name, item.name);
		}
	}, "tree");
	tree.startup();

	var $bar = dom.byId('create_bar');
	new Button({
		iconClass: 'dijitIconNewTask',
		label: 'New DB',
		showLabel: false,
		onClick: function () {
			var dbname = prompt('DB name?');
			if (!dbname) {
				return alert('Need a DB name!');
			}

			var childItem = {
				name: dbname,
				id: 'DB:' + dbname,
				parent: 'root',
				children: true
			};

			// update tree
			treeStore.add(childItem);

			// hack! dijit/tree does not update when the data is loaded by a promise
			var children = treeStore.query({parent:'root'});
			treeModel.childrenCache['root'] = children;
			// treeModel.onChange(childItem);
			treeModel.onChildrenChange(data[0], children);
			
		}
	}).placeAt($bar);

	new Button({
		iconClass: 'dijitIconDocuments',
		label: 'New Collection',
		showLabel: false,
		onClick: function () {
			var obj = tree.get("selectedItems")[0];
			if (!obj) return;

			var cname = prompt('Collection name?');
			if (!cname) {
				return alert('Need a collection name!');
			}

			var childItem = {
				name: cname,
				id: 'Collection:' + cname,
				parent: obj.id
			};

			// update tree
			treeStore.add(childItem);

			// hack! dijit/tree does not update when the data is loaded by a promise
			var children = treeStore.query({parent: obj.id});
			treeModel.childrenCache[obj.id] = children;
			// treeModel.onChange(childItem);
			treeModel.onChildrenChange(obj, children);
		}
	}).placeAt($bar);

	return tree;
});
