(function() {
	function isSupported(property) {
		return (property in document.body.style) ? property : undefined;
	}
	var transformProperty = isSupported('transform')
			|| isSupported('-webkit-transform')
			|| isSupported('-moz-transform')
			|| isSupported('-ms-transform');
		
	var panning = false;
	window.offset = {};
	window.scale = 1;
	var _x = 0;
	var _y = 0;
	Object.defineProperty(offset, 'pxX', {
		get: function() {
			return _x;
		},
		set: function(val) {
			_x = val;
			DOT_CONTAINER.style[transformProperty] = "translate(" + _x + "px," + _y + "px)";
		}
	});
	Object.defineProperty(offset, 'pxY', {
		get: function() {
			return _y;
		},
		set: function(val) {
			_y = val;
			DOT_CONTAINER.style[transformProperty] = "translate(" + _x + "px," + _y + "px)";
		}
	});
	Object.defineProperty(offset, 'mmX', {
		get: function() {
			return pxToMm(_x);
		},
		set: function(val) {
			_x = mmToPx(val);
			DOT_CONTAINER.style[transformProperty] = "translate(" + _x + "px," + _y + "px)";
		}
	});
	Object.defineProperty(offset, 'mmY', {
		get: function() {
			return pxToMm(_y);
		},
		set: function(val) {
			_y = mmToPx(val);
			DOT_CONTAINER.style[transformProperty] = "translate(" + _x + "px," + _y + "px)";
		}
	});
	addListeners(DOT_CONTAINER_WRAPPER, {
		onTapStart: function(e) {
		},
		onDragStart: function(e) {
			if (e.interactions == 1) {
				panning = true;
			}
		},
		onDragMove: function(e) {
			if (panning) {
				offset.pxX += e.pxDX/e.interactions;
				offset.pxY += e.pxDY/e.interactions;
			}
		},
		onHoldStart: function(e) {
			if (!panning)
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
	}, true);
})()