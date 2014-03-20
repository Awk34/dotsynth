(function() {
	function isSupported(property) {
		return (property in document.body.style) ? property : undefined;
	}
	var transformProperty = isSupported('transform')
			|| isSupported('-webkit-transform')
			|| isSupported('-moz-transform')
			|| isSupported('-ms-transform');
		
	var panning = false;
	var _x = 0;
	var _y = 0;
	window.offset = {};
	var _scale = 1;
	Object.defineProperty(window, 'scale', {
		get: function() {
			return _scale;
		},
		set: function(val) {
			var ratio = val/_scale;
			offset.pxX += ((centerX-offset.pxX)/val - (centerX-offset.pxX)/_scale)*val;
			offset.pxY += ((centerY-offset.pxY)/val - (centerY-offset.pxY)/_scale)*val;
			_scale = val;
			_redraw();
		}
	});
	var centerX = 0;
	var centerY = 0;
	function _redraw() {
		DOT_CONTAINER.style[transformProperty] = "translate(" + _x + "px," + _y + "px) scale(" + _scale + ")";
	}
	Object.defineProperty(offset, 'pxX', {
		get: function() {
			return _x;
		},
		set: function(val) {
			_x = val;
			_redraw();
		}
	});
	Object.defineProperty(offset, 'pxY', {
		get: function() {
			return _y;
		},
		set: function(val) {
			_y = val;
			_redraw();
		}
	});
	Object.defineProperty(offset, 'mmX', {
		get: function() {
			return pxToMm(_x);
		},
		set: function(val) {
			_x = mmToPx(val);
			_redraw();
		}
	});
	Object.defineProperty(offset, 'mmY', {
		get: function() {
			return pxToMm(_y);
		},
		set: function(val) {
			_y = mmToPx(val);
			_redraw();
		}
	});
	addListeners(DOT_CONTAINER_WRAPPER, {
		onTapStart: function(e) {
			var centerWeight = (e.interactions-1)/e.interactions;
			var newTouchWeight = 1/e.interactions;
			centerX = centerWeight*centerX + newTouchWeight*e.clientX;
			centerY = centerWeight*centerY + newTouchWeight*e.clientY;
		},
		onDragStart: function(e) {
			if (e.interactions >= 1) {
				panning = true;
			}
		},
		onDragMove: function(e) {
			if (panning) {
				offset.pxX += e.pxDX/e.interactions;
				offset.pxY += e.pxDY/e.interactions;
				if (e.interactions >= 2) {
					var oldDistanceFromCenterX = e.clientX-e.pxDX-centerX;
					var oldDistanceFromCenterY = e.clientY-e.pxDY-centerY;
					var oldDistanceFromCenter = Math.sqrt(Math.pow(oldDistanceFromCenterX,2)+Math.pow(oldDistanceFromCenterY,2));
					var centerWeight = (e.interactions-1)/e.interactions;
					var newTouchWeight = 1/e.interactions;
					centerX += newTouchWeight*e.pxDX;
					centerY += newTouchWeight*e.pxDY;
					var newDistanceFromCenterX = e.clientX-centerX;
					var newDistanceFromCenterY = e.clientY-centerY;
					var newDistanceFromCenter = Math.sqrt(Math.pow(newDistanceFromCenterX,2)+Math.pow(newDistanceFromCenterY,2));
					var scaleFactor = (newDistanceFromCenter / oldDistanceFromCenter);
					scaleFactor = Math.pow(scaleFactor, 2/e.interactions);
					scale *= scaleFactor;
				} else {
					centerX = e.clientX;
					centerY = e.clientY;
				}
			}
		},
		onHoldStart: function(e) {
			if (!panning && e.interactions == 1)
				dotMenuEvent(e);
		},
		onTapEnd: function(e) {
			if (e.interactions == 0) {
				panning = false;
			}
		},
		onHoldEnd: function(e) {
			if (e.interactions == 0) {
				panning = false;
			}
		},
		onDragEnd: function(e) {
			if (e.interactions == 0) {
				panning = false;
			}
		}
	}, true, 10);
})()