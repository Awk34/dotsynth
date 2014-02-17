/**
 * A helper function used to add all listeners at once to an element. Additionally, it handles
 * touch AND mouse configurations. All the callbacks take 1 argument, an event.
 *
 * All interactions are assumed to be linked to the pointer/cursor/finger that began the event.
 * i.e.: Once the event begins, no other element is able to use the interactions of that finger
 *
 * @param element The element to add the listeners to
 *
 * @param listeners An object that has all of the listeners to be added:
 * 		onTapStart      A callback function for when the interaction begins
 * 		onHoldStart     A callback function for when the interaction becomes a hold
 * 		onDragStart     A callback function for when the interaction becomes a drag (not a hold-drag)
 * 		onHoldDragStart A callback function for when the interaction becomes a hold-drag
 *		
 * 		onDragMove      A callback function for when the interaction is a drag (not a hold-drag), and moved
 * 		onHoldDragMove  A callback function for when the interaction is a hold-drag, and moved
 *		
 * 		onTapEnd        A callback function for when the the interactions ends as a tap
 * 		onHoldEnd       A callback function for when the the interactions ends as a hold
 * 		onDragEnd       A callback function for when the the interactions ends as a drag (not a hold-drag)
 * 		onHoldDragEnd   A callback function for when the the interactions ends as a hold-drag
 */
function addListeners(element, listeners) {
	var onTapStart = listeners.onTapStart;
	var onHoldStart = listeners.onHoldStart;
	var onDragStart = listeners.onDragStart;
	var onHoldDragStart = listeners.onHoldDragStart;
	var onDragMove = listeners.onDragMove;
	var onHoldDragMove = listeners.onHoldDragMove;
	var onTapEnd = listeners.onTapEnd;
	var onHoldEnd = listeners.onHoldEnd;
	var onDragEnd = listeners.onDragEnd;
	var onHoldDragEnd = listeners.onHoldDragEnd;
	var self = this;
	//keep track of when this object has focus;
	//don't let multiple interactions happen at once.
	var hasFocus = false;
	var touchId = null;
	element.addEventListener('touchstart', function(e) {
		//only begin an interaction if there is not already one occurring.
		if (!hasFocus) {
			hasFocus = true;
			var targetTouch = e.targetTouches[0];
			touchId = targetTouch.identifier;
			var initialPos = {
				x:targetTouch.pageX,
				y:targetTouch.pageY
			}
			if (onTapStart) onTapStart();
			var hold = false;
			var drag = false;
			var touchTime = setTimeout(function() {
				//if enough time passes, hold starts
				hold = true;
				if (onHoldStart) onHoldStart();
			}, TAP_TIMEOUT);
			function onTouchMove(e) {
				var targetTouch = findTouch(touchId, e.changedTouches);
				//only proceed if this event is related to the pointer we are tracking.
				if (targetTouch !== null) {
					if (!drag) {
						//test for dragging
						var dx = pxToMm(targetTouch.pageX - initialPos.x);
						var dy = pxToMm(targetTouch.pageY - initialPos.y);
						
						//check if exited dragbox
						if ( Math.abs(dy) > DRAG_BOX_SIZE/2 || Math.abs(dx) > DRAG_BOX_SIZE/2 ) {
							drag = true;
							clearTimeout(touchTime);
							//begin drag effects
							if (hold) {
								//begin hold drag
								if (onHoldDragStart) onHoldDragStart();
							} else {
								//begin normal drag
								if (onDragStart) onDragStart();
							}
						}
					} else {
						//drag
						if (hold) {
							if (onHoldDragMove) onHoldDragMove();
						} else {
							if (onDragMove) onDragMove();
						}
					}
					e.preventDefault();
				}
			}
			function onTouchEnd(e) {
				var targetTouch = findTouch(touchId, e.changedTouches);
				if (targetTouch !== null) {
					touchId = null;
					hasFocus = false;
					clearTimeout(touchTime);
					if (drag) {
						//drag
						if (hold) {
							if (onHoldDragEnd) onHoldDragEnd();
						} else {
							if (onDragEnd) onDragEnd();
						}
					} else {
						//non-drag
						if (hold) {
							if (onHoldEnd) onHoldEnd();
						} else {
							if (onTapEnd) onTapEnd();
						}
					}
					document.removeEventListener('touchmove', onTouchMove);
					document.removeEventListener('touchend', onTouchEnd);
					e.preventDefault();
				}
			}
			document.addEventListener('touchmove', onTouchMove);
			document.addEventListener('touchend', onTouchEnd);
			//only stop propagation on interaction start (indicating that this event has been 'captured');
			e.stopPropagation();
			e.preventDefault();
		}
	});
	
	//now for mouse controls...
	if (this.mouseIsDown === undefined) this.mouseIsDown = false;
	element.addEventListener('mousedown', function(e) {
		//only begin an interaction if there is not already one occurring.
		var left = e.button == 0;
		var right = e.button == 2;
		if (!hasFocus && (left ^ right) && !self.mouseIsDown) {
			hasFocus = true;
			self.mouseIsDown = true;
			var initialPos = {
				x:e.pageX,
				y:e.pageY
			}
			if (onTapStart) onTapStart();
			var hold = false;
			var drag = false;
			var touchTime = setTimeout(function() {
				//if enough time passes, hold starts
				hold = true;
				if (onHoldStart) onHoldStart();
			}, (right ? 0 : TAP_TIMEOUT));
			function onMouseMove(e) {
				if (!drag) {
					//test for dragging
					var dx = pxToMm(e.pageX - initialPos.x);
					var dy = pxToMm(e.pageY - initialPos.y);
					
					//check if exited dragbox
					if ( Math.abs(dy) > DRAG_BOX_SIZE/2 || Math.abs(dx) > DRAG_BOX_SIZE/2 ) {
						drag = true;
						clearTimeout(touchTime);
						//begin drag effects
						if (hold) {
							//begin hold drag
							if (onHoldDragStart) onHoldDragStart();
						} else {
							//begin normal drag
							if (onDragStart) onDragStart();
						}
					}
				} else {
					//drag
					if (hold) {
						if (onHoldDragMove) onHoldDragMove();
					} else {
						if (onDragMove) onDragMove();
					}
				}
				e.preventDefault();
			}
			function onMouseUp(e) {
				hasFocus = false;
				self.mouseIsDown = false;
				clearTimeout(touchTime);
				if (drag) {
					//drag
					if (hold) {
						if (onHoldDragEnd) onHoldDragEnd();
					} else {
						if (onDragEnd) onDragEnd();
					}
				} else {
					//non-drag
					if (hold) {
						if (onHoldEnd) onHoldEnd();
					} else {
						if (onTapEnd) onTapEnd();
					}
				}
				document.removeEventListener('mousemove', onMouseMove);
				document.removeEventListener('mouseup', onMouseUp);
				e.preventDefault();
			}
			document.addEventListener('mousemove', onMouseMove);
			document.addEventListener('mouseup', onMouseUp);
			//only stop propagation on interaction start (indicating that this event has been 'captured');
			e.stopPropagation();
			e.preventDefault();
		}
	});
}

/**
 * Finds and returns a Touch of id from list
 */
function findTouch(id, list) {
	for (var i = 0; i < list.length; i++) {
		if (list[i].identifier === id)
			return list[i];
	}
	return null;
}


/**
 * helper funcs for mm to px and px to mm
 */
var unitReferenceElement = document.createElement('div');
unitReferenceElement.classList.add('unitReference');
document.body.appendChild(unitReferenceElement);
function mmToPx(val) {
	return val * unitReferenceElement.offsetWidth / 100/*mm*/;
}
function pxToMm(val) {
	return val / ( unitReferenceElement.offsetWidth / 100/*mm*/ );
}