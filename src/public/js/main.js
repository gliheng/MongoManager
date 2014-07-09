require([
	'dojo/_base/fx', 'dojo/parser', "dojo/dom", "dojo/dom-style", "dojo/json",
	"dojo/store/Memory", "dijit/tree/ObjectStoreModel", "dijit/Tree", 'dojo/dom-construct', 'dojox/grid/DataGrid',
	'dojo/data/ObjectStore', 'dijit/registry', 'dijit/layout/BorderContainer', 'dijit/layout/TabContainer', 'dijit/layout/ContentPane',
	'services',
	], function (
		fxBase, parser, dom, domStyle, json,
		Memory, ObjectStoreModel, Tree, domConstruct, DataGrid,
		ObjectStore, registry, BorderContainer, TabContainer, ContentPane,
		services) {

	parser.parse().then(function(objects){
		//Get rid of the loader once parsing is done
		fxBase.fadeOut({
			node: "preloader",
			onEnd: function() {
				domStyle.set("preloader", "display","none");
			}
		}).play();
	});

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
					ret.Data.forEach(function (name) {
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
					ret.Data.forEach(function (name) {
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

	var tabContainer = registry.byId('mainTabContainer');
	var addTab = function (dbname, cname) {
		var tabName = dbname + ':' + cname,
			tab = registry.byId(tabName);
		if (typeof tab === "undefined"){
			tab = new ContentPane({
				id: tabName,
				title: cname,
				closable: true
			});

			tabContainer.addChild(tab);

			services.RPCService.GetCollectionData({dbname: dbname, cname: cname}).then(function (ret) {

				var $node = domConstruct.create('div', {}, dom.byId('content'), 'last');
				var store = new Memory({ data: ret.Data}),
					dataStore = new ObjectStore({ objectStore: store }),
					schema = [];
				if (ret.Data.length >= 0) {
					var first = ret.Data[0];
					for (var key in first) {
						if (key === '_id')
							schema.push({name: key, field: key, hidden: true});
						else
							schema.push({name: key, field: key});
					}
				}
				var grid = new DataGrid({
					store: dataStore,
					query: { id: "*" },
					structure: schema
				}, $node);
				tab.addChild(grid);
			});
		}
		tabContainer.selectChild(tab);
	};

	var tree = new Tree({
		model: treeModel,
		showRoot: false,
		onOpenClick: true,
		onClick: function(item){
			if ('children' in item) return;

			addTab(item.parent.id, item.id);
		}
	}, "tree");
	tree.startup();


	// test
	services.RPCService.GetSchema({dbname: 'test', cname: 'users'}).then(function (ret) {
		console.log(ret);
	});

	var data = {name: 'jim123', job: 'fucker'};
	services.RPCService.InsertRecord({dbname: 'test', cname: 'users', data: JSON.stringify(data)}).then(function (ret) {
		console.log(ret);
	});
});

