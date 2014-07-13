define([
	'dojo', 'dojo/parser', 'dojo/query', "dojo/dom", 'dojo/topic', 'dijit/registry', 'dojo/json', 'dijit/Toolbar', 'dijit/form/Button', 'dojo/_base/array', 'dojo/promise/all',
	'dijit/layout/ContentPane',
	'dojo/data/ObjectStore', 'dojo/store/Observable', 'dijit/layout/BorderContainer', 'dijit/layout/TabContainer',
	'dojo/dom-construct', 'dojox/grid/DataGrid', 'dojox/grid/DataSelection',
	"dojo/store/Memory", 'dijit/Dialog', 'dojox/form/Manager', 'dijit/form/TextBox',
	'services',
	'dijit/form/NumberTextBox', 'dijit/form/TextBox'
], function (
	dojo, parser, query, dom, topic, registry, json, Toolbar, Button, array, promiseAll,
	ContentPane,
	ObjectStore, Observable, BorderContainer, TabContainer,
	domConstruct, DataGrid, DataSelection,
	Memory, Dialog, Manager, TextBox,
	services
) {

	var addTab = function (dbname, cname) {
		var tabContainer = registry.byId('mainTabContainer');

		var tabName = dbname + ':' + cname,
			tab = registry.byId(tabName);

		if (typeof tab === "undefined"){

			// create new tab
			tab = new ContentPane({
				id: tabName,
				title: cname,
				closable: true
			});

			tabContainer.addChild(tab);

			promiseAll([
				services.RPCService.GetCollectionData({dbname: dbname, cname: cname}),
				services.RPCService.GetSchema({dbname: dbname, cname: cname})
			]).then(function (ret) {
				var data = ret[0],
					schema = ret[1];

				if (!schema) {
					schema = [];
					if (data.length >= 0) {
						var first = data[0];
						for (var key in first) {
							if (key === '_id')
								schema.push({name: key, field: key, hidden: true});
							else
								schema.push({name: key, field: key});
						}
					}
				}

				// add toolbar
				var toolbar = new Toolbar({}, 'toolbar');
				var btnConfig = {
					"Create": function () {
						var dialog = new Dialog({
							// Dialog title
							title: "Create Data",
							// Create Dialog content
							content: '<form data-dojo-type="dojox/form/Manager" id="createForm"></form>',
							hide: function(){
								dialog.destroyRecursive();
							}
						});

						var $form = dom.byId('createForm');
						fillForm($form, schema);

						new Button({
							label: 'Create',
							onClick: function () {
								var form = registry.byId('createForm'),
									data = form.gatherFormValues();

								// TODO:
								// validate
								services.RPCService.InsertRecord({dbname: dbname, cname: cname, data: json.stringify(data)}).then(function (id) {
									grid.store.objectStore.add(dojo.mixin({_id: id}, data));

									dialog.onCancel();
									console.log('Insert success', id);
								});

							}
						}).placeAt($form);

						new Button({
							label: 'Close',
							onClick: function () {
								dialog.onCancel();
							}
						}).placeAt($form);

						parser.parse($form);
						dialog.startup();
						dialog.show();

					},

					"Modify": function () {
						var selected = grid.selection.getSelected();

						if (!selected.length) return;

						selected = selected[0];

						var dialog = new Dialog({
							// Dialog title
							title: "Modify Data",
							// Create Dialog content
							content: '<form data-dojo-type="dojox/form/Manager" id="createForm"></form>',
							hide: function(){
								dialog.destroyRecursive();
							}
						});

						var $form = dom.byId('createForm');
						fillForm($form, schema);

						new Button({
							label: 'Modify',
							onClick: function () {
								var form = registry.byId('createForm'),
									id = selected._id,
									data = form.gatherFormValues();
								// form.setFormValues({name: 123});

								// TODO:
								// validate
								services.RPCService.UpdateRecord({dbname: dbname, cname: cname, id: id, data: json.stringify(data)}).then(function (ret) {
									grid.store.objectStore.put(dojo.mixin({_id: id}, data));

									
									// grid.addRow(data);
									dialog.onCancel();
									console.log('Update success', ret);
								});

							}
						}).placeAt($form);

						new Button({
							label: 'Close',
							onClick: function () {
								dialog.onCancel();
							}
						}).placeAt($form);

						parser.parse($form);
						dialog.startup();
						dialog.show();

						var form = registry.byId('createForm');
						form.setFormValues(selected);
					},

					"Delete": function () {
						var selected = grid.selection.getSelected();

						selected = array.map(selected, function (item){
							return item._id;
						});

						if (!selected.length) return;

						services.RPCService.RemoveRecords({dbname: dbname, cname: cname, data: selected.join(',')}).then(function (ret) {
							array.forEach(selected, function (item) {
								grid.store.objectStore.remove(item);
							});
							// grid.removeSelectedRows();
							
							// array.forEach(function () {
							// });
							// grid.store.objectStore.remove(id}, data));
							console.log('Remove success', ret);
						});
					}
				};

				for (var label in btnConfig) {
					var handler = btnConfig[label],
						button = new Button({
							label: label,
							showLabel: true
						});
					button.on('click', handler)
					toolbar.addChild(button);
				};

				tab.addChild(toolbar);


				var $node = domConstruct.create('div', {}, dom.byId('content'), 'last');

				var store = new Memory({data: data, idProperty: '_id'}),
					store = new Observable(store),
					dataStore = new ObjectStore({objectStore: store});

				var grid = new DataGrid({
					store: dataStore,
					query: { id: "*" },
					structure: schema
				}, $node);

				tab.addChild(grid);

				store.query().observe(function (item, removedFrom, insertedInto) {
					// TODO, do I need all these methods?
					grid._refresh(true);
					grid.update();

					if (removedFrom > -1) {
					}

					if (insertedInto > -1) {
					}
				}, true);
			});

		}
		tabContainer.selectChild(tab);
	};

	function fillForm(root, schema, values) {
		array.forEach(schema, function (field) {
			var html;
			switch (field._type) {
			case 'string':
				html = '<label><span>' + field.name + '</span>:'
					+ '<input name="' + field.field + '" data-dojo-type="dijit/form/TextBox" data-dojo-props="placeHolder:\'Enter text here.\'">'
					+ '</label>';
				break;
			case 'number':
				html = '<label><span>' + field.name + '</span>:'
					+ '<input name="' + field.field + '" data-dojo-type="dijit/form/NumberTextBox" data-dojo-props="placeHolder:\'Enter text here.\'">'
					+ '</label>';
				break;
			case 'boolean':
				html = '<label><span>' + field.name + '</span>:'
					+ '<input type="checkbox" name="' + field.field + '" data-dojo-type="dijit/form/CheckBox">'
					+ '</label>';
				break;
			}

			var $div = domConstruct.create('div', {
				innerHTML: html
			});
			domConstruct.place($div, root);
		});
	}

	topic.subscribe('addTab', addTab);

});
