define([
	'dojo', 'dojo/parser', 'dojo/_base/declare', 'dojo/_base/lang', 'dojo/query', "dojo/dom", 'dojo/topic', 'dijit/registry', 'dojo/json', 'dijit/Toolbar', 'dijit/form/Button', 'dojo/_base/array', 'dojo/promise/all',
	'dijit/layout/ContentPane',
	'dojo/data/ObjectStore', 'dojo/store/Observable', 'dijit/layout/BorderContainer', 'dijit/layout/TabContainer',
	'dojo/dom-construct', 'dojox/grid/DataGrid', 'dojox/grid/DataSelection',
	"dojo/store/Memory", 'dijit/Dialog', 'dojox/form/Manager', 'dijit/form/TextBox',
	'dijit/form/NumberTextBox',
	'services', 'addons'
], function (
	dojo, parser, declare, lang, query, dom, topic, registry, json, Toolbar, Button, array, promiseAll,
	ContentPane,
	ObjectStore, Observable, BorderContainer, TabContainer,
	domConstruct, DataGrid, DataSelection,
	Memory, Dialog, Manager, TextBox, NumberTextBox,
	services, addons
) {

	var Tab = declare([ContentPane], {
		constructor: function (opts) {
			this.dbname = opts.dbname;
			this.cname = opts.cname;
			this.inherited(arguments);
		},

		postCreate: function () {
			promiseAll([
				services.RPCService.GetCollectionData({dbname: this.dbname, cname: this.cname}),
				services.RPCService.GetSchema({dbname: this.dbname, cname: this.cname})
			]).then(lang.hitch(this, 'createDialog'));
		},

		createDialog: function (ret) {
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
			this.schema = schema;
			this.data = data;

			var btnConfig = {
				"Create": function () {
					var self = this;
					var dialog = new Dialog({
						// Dialog title
						title: "Create Data",
						// Create Dialog content
						content: '<form data-dojo-type="dojox/form/Manager" id="form"></form>',
						hide: function(){
							dialog.destroyRecursive();
						}
					});

					self.makeForm();

					new Button({
						label: 'Create',
						onClick: function () {
							var form = registry.byId('form'),
								data = form.gatherFormValues();

							// TODO:
							// validate
							services.RPCService.InsertRecord({dbname: self.dbname, cname: self.cname, data: json.stringify(data)}).then(function (id) {
								self.grid.store.objectStore.add(dojo.mixin({_id: id}, data));

								dialog.onCancel();
								console.log('Insert success', id);
							});

						}
					}).placeAt(self.$form);

					new Button({
						label: 'Close',
						onClick: function () {
							dialog.onCancel();
						}
					}).placeAt(self.$form);

					parser.parse(self.$form);
					dialog.startup();
					dialog.show();

				},

				"Modify": function () {
					var self = this;
					var selected = self.grid.selection.getSelected();

					if (!selected.length) return;

					selected = selected[0];

					var dialog = new Dialog({
						// Dialog title
						title: "Modify Data",
						// Create Dialog content
						content: '<form data-dojo-type="dojox/form/Manager" id="form"></form>',
						hide: function(){
							dialog.destroyRecursive();
						}
					});

					self.makeForm();

					new Button({
						label: 'Modify',
						onClick: function () {
							var form = registry.byId('form'),
								id = selected._id,
								data = form.gatherFormValues();
							// form.setFormValues({name: 123});

							// TODO:
							// validate
							services.RPCService.UpdateRecord({dbname: self.dbname, cname: self.cname, id: id, data: json.stringify(data)}).then(function (ret) {
								self.grid.store.objectStore.put(dojo.mixin({_id: id}, data));

								
								// grid.addRow(data);
								dialog.onCancel();
								console.log('Update success', ret);
							});

						}
					}).placeAt(self.$form);

					new Button({
						label: 'Close',
						onClick: function () {
							dialog.onCancel();
						}
					}).placeAt(self.$form);

					parser.parse(self.$form);
					dialog.startup();
					dialog.show();

					var form = registry.byId('form');
					form.setFormValues(selected);
				},

				"Delete": function () {
					var self = this;
					var selected = self.grid.selection.getSelected();

					selected = array.map(selected, function (item){
						return item._id;
					});

					if (!selected.length) return;

					services.RPCService.RemoveRecords({dbname: self.dbname, cname: self.cname, data: selected.join(',')}).then(function (ret) {
						array.forEach(selected, function (item) {
							self.grid.store.objectStore.remove(item);
						});
						// grid.removeSelectedRows();
						
						// array.forEach(function () {
						// });
						// grid.store.objectStore.remove(id}, data));
						console.log('Remove success', ret);
					});
				},

			};

			// get addon
			for (var addon, i = 0; addon = addons[i]; i++) {
				if (addon.Db === this.dbname && addon.Collection === this.cname && addon.btns) {
					lang.mixin(btnConfig, addon.btns);
					break;
				}
			}

			// add toolbar
			var toolbar = new Toolbar({}, 'toolbar');
			for (var label in btnConfig) {
				var handler = lang.hitch(this, btnConfig[label]),
					button = new Button({
						label: label,
						showLabel: true
					});
				button.on('click', handler)
				toolbar.addChild(button);
			};

			this.addChild(toolbar);

			this.makeGrid(schema, data);

		},

		makeGrid: function (schema, data) {

			var $node = domConstruct.create('div', {}, dom.byId('content'), 'last');

			var store = new Memory({data: data, idProperty: '_id'}),
				store = new Observable(store),
				dataStore = new ObjectStore({objectStore: store});

			var grid = new DataGrid({
				store: dataStore,
				query: { id: "*" },
				structure: schema
			}, $node);

			this.addChild(grid);

			store.query().observe(function (item, removedFrom, insertedInto) {
				// TODO, do I need all these methods?
				grid._refresh(true);
				grid.update();

				if (removedFrom > -1) {
				}

				if (insertedInto > -1) {
				}
			}, true);

			this.grid = grid;
		},

		makeForm: function (schema) {

			var $form = dom.byId('form');

			array.forEach(schema || this.schema, function (field) {
				var html;
				switch (field._type) {
				case 'string':
					html = '<label><span class="name">' + field.name + ':</span>'
						+ '<input name="' + field.field + '" data-dojo-type="dijit/form/TextBox" data-dojo-props="placeHolder:\'Enter text here.\'">'
						+ '</label>';
					break;
				case 'number':
					html = '<label><span class="name">' + field.name + ':</span>'
						+ '<input name="' + field.field + '" data-dojo-type="dijit/form/NumberTextBox" data-dojo-props="placeHolder:\'Enter text here.\'">'
						+ '</label>';
					break;
				case 'boolean':
					html = '<label><span class="name">' + field.name + ':</span>'
						+ '<input type="checkbox" name="' + field.field + '" data-dojo-type="dijit/form/CheckBox">'
						+ '</label>';
					break;
				}

				var $div = domConstruct.create('div', {
					innerHTML: html
				});
				domConstruct.place($div, $form);
			});

			this.$form = $form;
		},

		filterData: function (data, schema) {
			var keys = {};
			array.forEach(schema, function (field) {
				keys[field.field] = true;
			});

			delete keys._id;

			var ret = {};
			for (var key in keys) {
				ret[key] = data[key];
			}
			return ret;
		}

	});

	Tab.addTab = function (dbname, cname) {
		var tabContainer = registry.byId('mainTabContainer');

		var tabName = dbname + ':' + cname,
			tab = registry.byId(tabName);

		if (typeof tab === "undefined"){
			// create new tab
			tab = new Tab({
				dbname: dbname,
				cname: cname,
				id: tabName,
				title: cname,
				closable: true
			});

			tabContainer.addChild(tab);

		}
		tabContainer.selectChild(tab);
	};

	return Tab;

});
