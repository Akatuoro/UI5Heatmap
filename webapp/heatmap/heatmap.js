sap.ui.define([
	"QuickStartApplication/heatmap/defaultData"
], function(defaultData) {

	return {
		init: function(canvas) {
			this.canvas = canvas;
			this.ctx = canvas.getContext('2d');
			this.max = 4;
			this.lineWidth = 4;
			this.data = defaultData.routes || [];
		},

		defaultGradient: {
			0.0: 'blue',
			0.5: 'orange',
			1.0: 'red'
		},

		setData: function(data) {
			this.data = data;
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
			
			for (var i = 0; i < this.data.length; i++) {
				var route = this.data[i];
				ctx.globalAlpha = Math.min(Math.max(1 / this.max, 0.05), 1);
				ctx.lineWidth = this.lineWidth; // if the same stroke intersects, alphas don't add up

				ctx.beginPath();
				for (var j = 0; j < route.length; j++) {
					var c = route[j];
					var x = (c.lng - left) / dx * w;
					var y = (top - c.lat) / dy * h;
					//ctx.fillRect(x, y, 10, 10);
					ctx.lineTo(x, y);
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(x, y);
				}
			}

			/*
			for (var i = 0; i < this.data.length; i++) {
				var route = this.data[i];

				//ctx.shadowOffsetX = ctx.shadowOffsetY = 15 * 2;
				ctx.moveTo(route[0][0], route[0][1]);
				for (var j = 1; j < route.length; j++) {
					var lng = route[j][0];
					var lat = route[j][1];
					console.log("Long:", lng, long2tile(lng), left, "-", right);
					console.log("Lat:", lat, lat2tile(lat), bottom, "-", top);
					//ctx.shadowBlur = 200;
					//ctx.shadowColor = 'black';

					ctx.lineTo(long2tile(route[j][0]), lat2tile(route[j][1]));
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(long2tile(route[j][0]), lat2tile(route[j][1]));
				}
			}*/

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