/**
 * A helper function used to add all listeners at once to an element. Additionally, it handles
 * touch AND mouse configurations. All the callbacks take 1 argument, an event. That event has
 * a .pxX, .pxY, .mmX, and .mmY.
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
function addListeners(element, listeners, includeOffset, maxInteractions) {
	if (maxInteractions === undefined) maxInteractions = 1;
	var interactions = 0;

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
	
	var allowScroll = !(onDragStart || onDragMove || onDragEnd)
			&& !(onTapStart || onTapEnd);
	
	var self = this;
	//keep track of when this object has focus;
	//don't let multiple interactions happen at once.
	element.addEventListener('touchstart', function(e) {
		//only begin an interaction if there is not already one occurring.
		for ( var i = 0; i < e.changedTouches.length; i++ ) {
			eachTouch(e, e.changedTouches[i]);
		}
		function eachTouch(e, targetTouch) {
			if (interactions < maxInteractions) {
				interactions++;
				var cx = targetTouch.clientX;
				var cy = targetTouch.clientY;
				var returnEvent = {
					element: element,
					pxX: targetTouch.pageX / (includeOffset ? scale : 1) - (includeOffset ? offset.pxX / scale : 0),
					pxY: targetTouch.pageY / (includeOffset ? scale : 1) - (includeOffset ? offset.pxY / scale : 0),
					mmX: pxToMm(targetTouch.pageX / (includeOffset ? scale : 1)) - (includeOffset ? offset.mmX / scale : 0),
					mmY: pxToMm(targetTouch.pageY / (includeOffset ? scale : 1)) - (includeOffset ? offset.mmY / scale : 0),
					clientX: targetTouch.clientX,
					clientY: targetTouch.clientY,
					interactions: interactions,
					identifier: targetTouch.identifier
				}
				var touchId = targetTouch.identifier;
				var initialPos = {
					x:targetTouch.pageX,
					y:targetTouch.pageY
				}
				if (onTapStart) onTapStart(returnEvent);
				var hold = false;
				var drag = false;
				var touchTime = setTimeout(function() {
					//if enough time passes, hold starts
					hold = true;
					if (onHoldStart) onHoldStart(returnEvent);
				}, TAP_TIMEOUT);
				function onTouchMove(e) {
					var targetTouch = findTouch(touchId, e.changedTouches);
					//only proceed if this event is related to the pointer we are tracking.
					if (targetTouch !== null) {
						var returnEvent = {
							element: element,
							pxX: targetTouch.pageX / (includeOffset ? scale : 1) - (includeOffset ? offset.pxX / scale : 0),
							pxY: targetTouch.pageY / (includeOffset ? scale : 1) - (includeOffset ? offset.pxY / scale : 0),
							mmX: pxToMm(targetTouch.pageX / (includeOffset ? scale : 1)) - (includeOffset ? offset.mmX / scale : 0),
							mmY: pxToMm(targetTouch.pageY / (includeOffset ? scale : 1)) - (includeOffset ? offset.mmY / scale : 0),
							pxDX: targetTouch.clientX - cx,
							pxDY: targetTouch.clientY - cy,
							clientX: targetTouch.clientX,
							clientY: targetTouch.clientY,
							interactions: interactions,
							identifier: targetTouch.identifier
						}
						cx = targetTouch.clientX;
						cy = targetTouch.clientY;
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
									if (onHoldDragStart) onHoldDragStart(returnEvent);
								} else {
									//begin normal drag
									if (onDragStart) onDragStart(returnEvent);
								}
							}
						} else {
							//drag
							if (hold) {
								if (onHoldDragMove) onHoldDragMove(returnEvent);
								else if (onDragMove) onDragMove(returnEvent);
							} else {
								if (onDragMove) onDragMove(returnEvent);
							}
						}
						if (hold || !allowScroll)
							e.preventDefault();
					}
				}
				function onTouchEnd(e) {
					var targetTouch = findTouch(touchId, e.changedTouches);
					if (targetTouch !== null) {
						interactions--;
						var returnEvent = {
							element: element,
							pxX: targetTouch.pageX / (includeOffset ? scale : 1) - (includeOffset ? offset.pxX / scale : 0),
							pxY: targetTouch.pageY / (includeOffset ? scale : 1) - (includeOffset ? offset.pxY / scale : 0),
							mmX: pxToMm(targetTouch.pageX / (includeOffset ? scale : 1)) - (includeOffset ? offset.mmX / scale : 0),
							mmY: pxToMm(targetTouch.pageY / (includeOffset ? scale : 1)) - (includeOffset ? offset.mmY / scale : 0),
							pxDX: targetTouch.clientX - cx,
							pxDY: targetTouch.clientY - cy,
							clientX: targetTouch.clientX,
							clientY: targetTouch.clientY,
							interactions: interactions,
							identifier: targetTouch.identifier
						}
						touchId = null;
						clearTimeout(touchTime);
						if (drag) {
							//drag
							if (hold) {
								if (onHoldDragEnd) onHoldDragEnd(returnEvent);
								else if (onDragEnd) onDragEnd(returnEvent);
							} else {
								if (onDragEnd) onDragEnd(returnEvent);
							}
						} else {
							//non-drag
							if (hold) {
								if (onHoldEnd) onHoldEnd(returnEvent);
								else if (onTapEnd) onTapEnd(returnEvent);
							} else {
								if (onTapEnd) onTapEnd(returnEvent);
							}
						}
						document.removeEventListener('touchmove', onTouchMove);
						document.removeEventListener('touchend', onTouchEnd);
						if (hold || !allowScroll)
							e.preventDefault();
					}
				}
				document.addEventListener('touchmove', onTouchMove);
				document.addEventListener('touchend', onTouchEnd);
				//only stop propagation on interaction start (indicating that this event has been 'captured');
				e.stopPropagation();
				if (!allowScroll)
					e.preventDefault();
			}
		}
	});
	
	//now for mouse controls...
	if (this.mouseIsDown === undefined) this.mouseIsDown = false;
	element.addEventListener('mousedown', function(e) {
		//only begin an interaction if there is not already one occurring.
		var left = e.button == 0;
		var right = e.button == 2;
		if (interactions < maxInteractions && (left ^ right) && !self.mouseIsDown) {
			interactions++;
			var cx = e.clientX;
			var cy = e.clientY;
			var returnEvent = {
				element: element,
				pxX: e.pageX / (includeOffset ? scale : 1) - (includeOffset ? offset.pxX / scale : 0),
				pxY: e.pageY / (includeOffset ? scale : 1) - (includeOffset ? offset.pxY / scale : 0),
				mmX: pxToMm(e.pageX / (includeOffset ? scale : 1)) - (includeOffset ? offset.mmX / scale : 0),
				mmY: pxToMm(e.pageY / (includeOffset ? scale : 1)) - (includeOffset ? offset.mmY / scale : 0),
				clientX: e.clientX,
				clientY: e.clientY,
				interactions: interactions,
				identifier: "cursor"
			}
			self.mouseIsDown = true;
			var initialPos = {
				x:e.pageX,
				y:e.pageY
			}
			if (onTapStart) onTapStart(returnEvent);
			var hold = false;
			var drag = false;
			var touchTime = setTimeout(function() {
				//if enough time passes, hold starts
				hold = true;
				if (onHoldStart) onHoldStart(returnEvent);
			}, (right ? 0 : TAP_TIMEOUT));
			function onMouseMove(e) {
				var returnEvent = {
					element: element,
					pxX: e.pageX / (includeOffset ? scale : 1) - (includeOffset ? offset.pxX / scale : 0),
					pxY: e.pageY / (includeOffset ? scale : 1) - (includeOffset ? offset.pxY / scale : 0),
					mmX: pxToMm(e.pageX / (includeOffset ? scale : 1)) - (includeOffset ? offset.mmX / scale : 0),
					mmY: pxToMm(e.pageY / (includeOffset ? scale : 1)) - (includeOffset ? offset.mmY / scale : 0),
					pxDX: e.clientX - cx,
					pxDY: e.clientY - cy,
					clientX: e.clientX,
					clientY: e.clientY,
					interactions: interactions,
					identifier: "cursor"
				}
				cx = e.clientX;
				cy = e.clientY;
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
							if (onHoldDragStart) onHoldDragStart(returnEvent);
						} else {
							//begin normal drag
							if (onDragStart) onDragStart(returnEvent);
						}
					}
				} else {
					//drag
					if (hold) {
						if (onHoldDragMove) onHoldDragMove(returnEvent);
						else if (onDragMove) onDragMove(returnEvent);
					} else {
						if (onDragMove) onDragMove(returnEvent);
					}
				}
				e.preventDefault();
			}
			function onMouseUp(e) {
				interactions--;
				var returnEvent = {
					element: element,
					pxX: e.pageX / (includeOffset ? scale : 1) - (includeOffset ? offset.pxX / scale : 0),
					pxY: e.pageY / (includeOffset ? scale : 1) - (includeOffset ? offset.pxY / scale : 0),
					mmX: pxToMm(e.pageX / (includeOffset ? scale : 1)) - (includeOffset ? offset.mmX / scale : 0),
					mmY: pxToMm(e.pageY / (includeOffset ? scale : 1)) - (includeOffset ? offset.mmY / scale : 0),
					pxDX: e.clientX - cx,
					pxDY: e.clientY - cy,
					clientX: e.clientX,
					clientY: e.clientY,
					interactions: interactions,
					identifier: "cursor"
				}
				self.mouseIsDown = false;
				clearTimeout(touchTime);
				if (drag) {
					//drag
					if (hold) {
						if (onHoldDragEnd) onHoldDragEnd(returnEvent);
						else if (onDragEnd) onDragEnd(returnEvent);
					} else {
						if (onDragEnd) onDragEnd(returnEvent);
					}
				} else {
					//non-drag
					if (hold) {
						if (onHoldEnd) onHoldEnd(returnEvent);
						else if (onTapEnd) onTapEnd(returnEvent);
					} else {
						if (onTapEnd) onTapEnd(returnEvent);
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
	
	//stop the context menu from appearing on right-clicks
	element.addEventListener('contextmenu', function(e) {
		e.preventDefault();
		e.stopPropagation();
		return false;
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