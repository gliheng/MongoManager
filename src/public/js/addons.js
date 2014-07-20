define([
	'dojo/parser', 'dijit/Dialog', 'dijit/form/Button',
	'services', 'dijit/registry', 'dojo/json'
], function (parser, Dialog, Button, services, registry, json) {

	return [
		{
			"Db": "test",
			"Collection": "order_summary",
			"btns": {

				"AnswerOrder": function () {
					var self = this;

					var selected = self.grid.selection.getSelected();

					if (!selected.length) return;

					selected = selected[0];

					var cname = 'order_sub';

					services.RPCService.GetSchema({dbname: self.dbname, cname: cname}).then(function (schema) {
						var dialog = new Dialog({
							// Dialog title
							title: "Create Sub Order",
							// Create Dialog content
							content: '<form data-dojo-type="dojox/form/Manager" id="form"></form>',
							hide: function(){
								dialog.destroyRecursive();
							}
						});

						self.makeForm(schema);

						new Button({
							label: 'Create Sub Order',
							onClick: function () {
								var form = registry.byId('form'),
									data = form.gatherFormValues();

								// TODO:
								// validate
								services.RPCService.InsertRecord({
									dbname: self.dbname,
									cname: cname,
									data: json.stringify(data)})
								.then(function (newId) {

									var id = selected._id,
										selectedData = self.filterData(selected, self.schema);
									// TODO
									selectedData.status = 3;

									services.RPCService.UpdateRecord({
										dbname: self.dbname,
										cname: self.cname,
										id: id,
										data: json.stringify(selectedData)})
									.then(function (ret) {
										// TODO: update tab if it exist
										self.grid.store.objectStore.put(dojo.mixin({_id: id}, selectedData));
										
										// grid.addRow(data);
										dialog.onCancel();
										console.log('Update success', ret);
									});

									// self.grid.store.objectStore.add(dojo.mixin({_id: id}, data));
									console.log('Insert success', newId);
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
						form.setFormValues({
							summary_id: selected._id
						});
					});
				}
			}

		}
	];
});
