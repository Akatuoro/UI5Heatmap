sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"heatmap/heatmap"
], function(Controller, HeatMap) {
	"use strict";
	var oGeoMap;

	function debounce(func, wait, transform) {
		var timeout;
		return function(oEvent) {
			var context = this;
			var args = (transform) ? transform.apply(this, arguments) : arguments;
			var later = function() {
				timeout = null;
				func.apply(context, args);
			};
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	}

	var updateCanvas = debounce(function(viewPort) {
		var canvas = document.getElementById("canvas");
		console.log("Updating");
		HeatMap.draw();
	}, 300);

	return Controller.extend("QuickStartApplication.controller.View1", {
		onInit: function() {
			oGeoMap = this.getView().byId("GeoMap");
			var oMapConfig = {
				"MapProvider": [{
					"name": "HEREMAPS",
					"type": "",
					"description": "",
					"tileX": "256",
					"tileY": "256",
					"maxLOD": "20",
					"copyright": "Tiles Courtesy of HERE Maps",
					"Source": [{
						"id": "s1",
						"url": "http://toolserver.org/tiles/hikebike/{LOD}/{X}/{Y}.png"
					}]
				}],
				"MapLayerStacks": [{
					"name": "DEFAULT",
					"MapLayer": {
						"name": "layer1",
						"refMapProvider": "HEREMAPS",
						"opacity": "1.0",
						"colBkgnd": "RGB(255,255,255)"
					}
				}]
			};
			oGeoMap.setMapConfiguration(oMapConfig);
			oGeoMap.setRefMapLayerStack("DEFAULT");
			oGeoMap.attachEvent("centerChanged", this.onViewPortChanged);
			oGeoMap.attachEvent("zoomChanged", this.onViewPortChanged);
			
			var canvas = document.getElementById("canvas");
			Heatmap.init(canvas);
		},

		onAfterRendering: function() {
			var node = this.getView().byId("GeoMap").getDomRef();
			var canvas = document.getElementById("canvas");
			node.addEventListener("resize", function() {
				canvas.width = $(node).width();
				canvas.height = $(node).height();
			});
		},

		onViewPortChanged: function(oEvent) {
			var viewport = oEvent.getParameter("viewportBB");
			updateCanvas(viewport);
			console.log({
				upperLeft: viewport.upperLeft,
				lowerRight: viewport.lowerRight
			});
		}
	});

});