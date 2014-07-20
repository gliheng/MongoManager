require([
	'dojo/_base/fx', 'dojo/parser', "dojo/dom-style", 'dojo/topic',
	'tree_view', 'grid_view'
], function (fxBase, parser, domStyle, topic,
	tree, grid) {

	parser.parse().then(function(objects){
		//Get rid of the loader once parsing is done
		fxBase.fadeOut({
			node: "preloader",
			onEnd: function() {
				domStyle.set("preloader", "display","none");
			}
		}).play();
	});

	topic.subscribe('addTab', grid.addTab);

});


