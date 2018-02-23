sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";
	var oGeoMap;

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
				  }
			  ]
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
			console.log(oGeoMap);
			oGeoMap.attachEvent("centerChanged", this.onCenterChanged);
			console.log(document.getElementById("__shell0"));
			
			var node = document.getElementById("content");
			var canvas = document.createElement("canvas");
			node.appendChild(canvas);
			canvas.style.width = 600;
			canvas.style.height = 600;
			canvas.style.top = "0px";
			canvas.style.left = "0px";
		},
		onCenterChanged: function(oEvent) {
			var viewport = oEvent.getParameter("viewportBB");
			console.log({upperLeft: viewport.upperLeft, lowerRight: viewport.lowerRight});
		}
	});

});