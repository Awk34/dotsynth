var newDotMenu = document.createElementNS(NS, 'svg');
newDotMenu.classList.add('newDotMenu');
document.body.appendChild(newDotMenu);
var isVisible = false;

//TOUCH
	var touchId = null;
	function onTouchStart(e) {
		if (touchId == null) {
			var targetTouch = e.targetTouches[0];
			touchId = targetTouch.identifier;
			document.addEventListener('touchmove', onTouchMove);
			document.addEventListener('touchend', onTouchEnd);
			var initialPos = {
				x:targetTouch.pageX,
				y:targetTouch.pageY
			}
			var hold = false;
			var drag = false;
			var touchTime = setTimeout(function() {
				hold = true;
				//TODO: hold effect
				navigator.vibrate(HOLD_EFFECT_VIBRATE_TIME);
				console.log('begin hold!');
			}, TAP_TIMEOUT);
			e.preventDefault();
		}
		function onTouchMove(e) {
			var targetTouch = findTouch(touchId, e.changedTouches);
			if (targetTouch !== null) {
				if (!drag) {
					//test for dragging
					var dx = pxToMm(targetTouch.pageX - initialPos.x)
					var dy = pxToMm(targetTouch.pageY - initialPos.y)
					
					//check if exited dragbox
					if ( Math.abs(dy) > DRAG_BOX_SIZE/2 || Math.abs(dx) > DRAG_BOX_SIZE/2 ) {
						drag = true;
						clearTimeout(touchTime);
						//TODO: begin drag effects
						console.log('begin drag!');
						if (hold) {
							//begin hold drag
							conn = new connection(selfDot);
						} else {
							//begin normal drag
						}
					}
				} else {
					//drag stuffs
					if (hold) {
						//TODO: middle of hold drag
						conn.endAt(pxToMm(targetTouch.pageX), pxToMm(targetTouch.pageY));
					} else {
						//TODO: middle of normal drag
						//move dot
						selfDot.x = pxToMm(targetTouch.pageX);
						selfDot.y = pxToMm(targetTouch.pageY);
					}
				}
				e.preventDefault();
			}
		}
		function onTouchEnd(e) {
			var targetTouch = findTouch(touchId, e.changedTouches);
			if (targetTouch !== null) {
				touchId = null;
				clearTimeout(touchTime);
				if (drag) {
					if (hold) {
						//TODO: end of hold drag
						conn.finalize(document.elementFromPoint(targetTouch.clientX, targetTouch.clientY));
					} else {
						//TODO: end of normal drag
					}
				} else { // tap / hold
					if (hold) {
						//TODO: end of hold
					} else {
						//TODO: end of tap
						selfDot.toggle();
					}
				}
				document.removeEventListener('touchmove', onTouchMove);
				document.removeEventListener('touchend', onTouchEnd);
				e.preventDefault();
			}
			//if dot is over trash can, delete it?
			// else if() {

			// }
		}
	}
	this.centerElement.addEventListener('touchstart', onTouchStart);
















document.addEventListener('mousedown', function(e) {
	
});
document.addEventListener('mousemove', function(e) {
	
});
document.addEventListener('mouseup', function(e) {
	
});

document.addEventListener('click', function(e) {
	if (e.target.parentElement !== null) return;
	var x = e.pageX;
	var y = e.pageY;
	if (isVisible) {
		isVisible = false;
		newDotMenu.style.display = "none";
		newDotMenu.style.visibility = "hidden";
	} else {
		isVisible = true;
		newDotMenu.style.display = "block";
		newDotMenu.innerHTML = '';
		//recreate this menu
		var radius = layerRadius(DOT_LIST.length);
		var size = (radius + DOT_RADIUS + GAP_WIDTH)*2;
		function pxToMm(val) {
			return val / ( newDotMenu.offsetHeight / size );
		}
		newDotMenu.setAttributeNS(null, 'width', size + UNITS);
		newDotMenu.setAttributeNS(null, 'height', size + UNITS);
		newDotMenu.setAttributeNS(null, 'viewBox', '0 0 ' + size + ' ' + size);
		newDotMenu.style.left = x - newDotMenu.offsetWidth/2 + "px";
		newDotMenu.style.top = y - newDotMenu.offsetHeight/2 + "px";
		//add menu items
		for (var i = 0; i < DOT_LIST.length; i++) {
			var angle = 3*Math.PI/2 + 2*Math.PI * i/DOT_LIST.length;
			var circle = document.createElementNS(NS, 'circle');
			var cx = size/2 + radius*Math.cos(angle);
			var cy = size/2 + radius*Math.sin(angle);
			
			
			
			var name = document.createElementNS(NS, 'text');
			name.setAttributeNS(null, 'x', cx);
			name.setAttributeNS(null, 'y', cy);
			name.setAttributeNS(null, 'text-anchor', 'middle');
			name.setAttributeNS(null, 'dominant-baseline', 'middle');
			name.setAttributeNS(null, 'font-size', DOT_NAME_SIZE);
			name.setAttributeNS(null, 'fill', 'black');
			name.innerHTML = DOT_LIST[i].shortName;
			
			
			
			
			circle.setAttributeNS(null, 'cx', cx);
			circle.setAttributeNS(null, 'cy', cy);
			circle.setAttributeNS(null, 'r', DOT_RADIUS);
			circle.setAttributeNS(null, 'fill', 'hsla(' + DOT_LIST[i].hue + ', 100%, ' + DOT_LIGHTNESS + ', 1)');
			circle.dotDefinition = DOT_LIST[i];
			circle.addEventListener('click', function() {
				e.stopPropagation();
				e.preventDefault();
				x = pxToMm(x);
				y = pxToMm(y);
				
				var definition = this.dotDefinition;
				new dot(definition, x, y);
				
				setTimeout(function(){
					isVisible = false;
					newDotMenu.style.display = "none";
					newDotMenu.style.visibility = "hidden";
				},0);
			});
			newDotMenu.appendChild(circle);
			newDotMenu.appendChild(name);
		}
		newDotMenu.style.visibility = "visible";
	}
});

function layerRadius(layer) {
	return Math.max(
		(DOT_RADIUS+GAP_WIDTH)/(Math.cos( (Math.PI*(layer-2)) / (2*layer) )),
		DOT_RADIUS*2+GAP_WIDTH
	);
}
