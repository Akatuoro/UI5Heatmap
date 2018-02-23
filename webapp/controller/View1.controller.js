sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"QuickStartApplication/heatmap/heatmap"
], function(Controller, HeatMap) {
	"use strict";
	var oGeoMap;
	var oCanvas;
	var oViewPort;
	var oZoom;
	var bInit = false;

	function debounce(func, wait, transform) {
		var timeout;
		return function() {
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

	var updateCanvas = debounce(function(viewPort, zoom) {
		if (bInit) {
			HeatMap.draw(viewPort, zoom);
		}
	}, 300);

	function resizeCanvas() {
		bInit = true;
		var node = oGeoMap.getDomRef();
		oCanvas.width = $(node).width();
		oCanvas.height = $(node).height();
		updateCanvas(oViewPort, oZoom);
	}
	
	window.onload = resizeCanvas;
	window.addEventListener("resize", resizeCanvas);

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
			oGeoMap.setInitialPosition("4.232826232910156;50.789895149448974;1");
			oGeoMap.setInitialZoom(10);
			oGeoMap.setRefMapLayerStack("DEFAULT");
			oGeoMap.attachEvent("centerChanged", this.onViewPortChanged);
			oGeoMap.attachEvent("zoomChanged", this.onViewPortChanged);

			var canvas = oCanvas = document.createElement("canvas");
			canvas.className = "heatmap";
			HeatMap.init(canvas);
			document.getElementById("content").appendChild(canvas);
		},

		onAfterRendering: function() {},

		onViewPortChanged: function(oEvent) {
			var viewPort = oViewPort = oEvent.getParameter("viewportBB");
			var zoom = oZoom = parseInt(oEvent.getParameter("zoomLevel"));
			updateCanvas(viewPort, zoom);
		}
	});

});