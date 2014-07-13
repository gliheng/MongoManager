require([
	'dojo/_base/fx', 'dojo/parser', "dojo/dom-style",
	'services', 'tree_view', 'grid_view'
], function (fxBase, parser, domStyle) {

	parser.parse().then(function(objects){
		//Get rid of the loader once parsing is done
		fxBase.fadeOut({
			node: "preloader",
			onEnd: function() {
				domStyle.set("preloader", "display","none");
			}
		}).play();
	});

});


