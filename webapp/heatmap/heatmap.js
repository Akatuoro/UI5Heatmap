sap.ui.define([
	"QuickStartApplication/heatmap/defaultData"
], function(defaultData) {

	var accidents = [];
	$.get("/destinations/createAccident.xsjs", function(data) {
		accidents = JSON.parse(data);
	});

	return {
		init: function(canvas) {
			this.canvas = canvas;
			this.ctx = canvas.getContext('2d');
			this.max = 4;
			this.lineWidth = 4;
			this.routes = defaultData.routes || [];
		},

		defaultGradient: {
			0.0: 'blue',
			0.5: 'orange',
			1.0: 'red'
		},

		setData: function(data) {
			this.routes = data;
		},

		createGradient: function(grad) {
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');
			var gradient = ctx.createLinearGradient(0, 0, 0, 256);

			canvas.width = 1;
			canvas.height = 256;

			for (var i in grad) {
				gradient.addColorStop(+i, grad[i]);
			}

			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, 1, 256);

			return ctx.getImageData(0, 0, 1, 256).data;
		},

		draw: function(boundingBox, zoom) {
			if (!this.gradient) {
				this.gradient = this.createGradient(this.defaultGradient);
			}
			if (!this.ctx) {
				return;
			}
			var ctx = this.ctx;
			ctx.save();
			ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

			//if (boundingBox) {
			var upperLeft = boundingBox.upperLeft.split(";").map(parseFloat);
			var lowerRight = boundingBox.lowerRight.split(";").map(parseFloat);

			var left = upperLeft[0];
			var top = upperLeft[1];
			var right = lowerRight[0];
			var bottom = lowerRight[1];
			var dx = right - left;
			var dy = top - bottom;
			var w = this.canvas.width;
			var h = this.canvas.height;
			var sx = w / dx;
			var sy = h / dy;
			ctx.globalAlpha = Math.min(Math.max(1 / this.max, 0.05), 1);
			ctx.lineWidth = this.lineWidth; // if the same stroke intersects, alphas don't add up

			for (var i = 0; i < this.routes.length; i++) {
				var route = this.routes[i];

				ctx.beginPath();
				for (var j = 0; j < route.length; j++) {
					var c = route[j];
					var x = (c.lng - left) * sx;
					var y = (top - c.lat) * sy;
					//ctx.fillRect(x, y, 10, 10);
					ctx.lineTo(x, y);
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(x, y);
				}
			}

			var radius = Math.round((100 / 113320) * sx);
			ctx.shadowBlur = radius;
			ctx.shadowColor = "black";
			for (i = 0; i < accidents.length; i++) {
				ctx.beginPath();
				var accident = accidents[i];
				x = (accident.LONGITUDE - left) * sx;
				y = (top - accident.LATITUDE) * sy;
				// 1 lat = 113.32km => 500m = 500m/113320m
				ctx.arc(x, y, 5, 0, 2 * Math.PI);
				ctx.fill();
			}

			var imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
			this.applyGradient(imageData.data, this.gradient);
			ctx.putImageData(imageData, 0, 0);

			ctx.restore();
		},

		applyGradient: function(imageData, gradient) {
			var value = 0;
			for (var i = 0; i < imageData.length; i += 4) {
				value = imageData[i + 3] * 4;

				if (value) {
					imageData[i] = gradient[value];
					imageData[i + 1] = gradient[value + 1];
					imageData[i + 2] = gradient[value + 2];
					imageData[i + 3] = Math.min(imageData[i + 3] + 50, 255);
				}
			}
		}
	};
});