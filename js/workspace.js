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
	var centerX = 0;
	var centerY = 0;
	var avgDist = 0;
	var pointerList = [];
	pointerList.remove = function(e) {
		var id = e.identifier;
		var e;
		for (var i = 0; i < this.length; i++) {
			if (this[i].identifier == id) {
				e = this.splice(i,1)[0];
				break;
			}
		}
		var centerWeight = (e.interactions-1)/e.interactions;
		var newTouchWeight = 1/e.interactions;
		centerX = centerWeight*centerX + newTouchWeight*e.clientX;
		centerY = centerWeight*centerY + newTouchWeight*e.clientY;
		avgDist = this.findAverageDistance();
	}
	pointerList.add = function(e) {
		this.push(e);
		var centerWeight = (e.interactions-1)/e.interactions;
		var newTouchWeight = 1/e.interactions;
		centerX = centerWeight*centerX + newTouchWeight*e.clientX;
		centerY = centerWeight*centerY + newTouchWeight*e.clientY;
		avgDist = this.findAverageDistance();
	}
	pointerList.update = function(e) {
		for (var i = 0; i < this.length; i++) {
			if (this[i].identifier == e.identifier) {
				this[i] = e;
				break;
			}
		}
		if (panning) {
			offset.pxX += e.pxDX/e.interactions;
			offset.pxY += e.pxDY/e.interactions;
		}
		var centerWeight = (e.interactions-1)/e.interactions;
		var newTouchWeight = 1/e.interactions;
		centerX += newTouchWeight*e.pxDX;
		centerY += newTouchWeight*e.pxDY;
		if (e.interactions >= 2) {
			var newAvgDist = pointerList.findAverageDistance();
			scale *= newAvgDist/avgDist;
			avgDist = newAvgDist;
		} else {
			centerX = e.clientX;
			centerY = e.clientY;
		}
	}
	pointerList.findAverageDistance = function() {
		var avgDist = 0;
		for (var i = 0; i < this.length; i++) {
			var e = this[i];
			avgDist += Math.sqrt(Math.pow(e.clientX-centerX,2) + Math.pow(e.clientY-centerY,2));
		}
		return avgDist/this.length;
	}
	function onEnd(e) {
		pointerList.remove(e);
		if (e.interactions == 0) {
			panning = false;
		}
	}
	addListeners(DOT_CONTAINER_WRAPPER, {
		onTapStart: function(e) {
			pointerList.add(e);
		},
		onDragStart: function(e) {
			if (e.interactions >= 1) {
				panning = true;
			}
		},
		onDragMove: function(e) {
			pointerList.update(e);
		},
		onHoldStart: function(e) {
			if (!panning && e.interactions == 1)
				dotMenuEvent(e);
		},
		onTapEnd: function(e) {
			onEnd(e);
		},
		onHoldEnd: function(e) {
			onEnd(e);
		},
		onDragEnd: function(e) {
			onEnd(e);
		}
	}, true, 10);
})()