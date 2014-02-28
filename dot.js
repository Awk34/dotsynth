var dotList = [];
/**
 * Creates a new dot with all of its DOM elements
 */
function dot(definition, x, y) {
	dotList.push(this);
	var selfDot = this;
	var parent = this.parentElement = document.body;
	this.definition = definition;
	this.connections = [];
	this.node = definition.create();
	this.svgElement = document.createElementNS(NS, "svg");
	this.svgElement.setAttributeNS(null, 'width', SVG_SIZE + UNITS);
	this.svgElement.setAttributeNS(null, 'height', SVG_SIZE + UNITS);
	this.svgElement.setAttributeNS(null, 'viewBox','0 0 ' + SVG_SIZE + ' ' + SVG_SIZE);
	this.svgElement.style.position = "absolute";
	parent.appendChild(this.svgElement);
	
	Object.defineProperty(this, 'x', {
		get: function() {
			return x;
		},
		set: function(val) {
			x = val;
			this.svgElement.style.left = (x - SVG_SIZE/2) + UNITS;
			for (var i = 0; i < selfDot.connections.length; i++) {
				selfDot.connections[i].redraw();
			}
		}
	});
	Object.defineProperty(this, 'y', {
		get: function() {
			return y;
		},
		set: function(val) {
			y = val;
			this.svgElement.style.top = (y - SVG_SIZE/2) + UNITS;
			for (var i = 0; i < selfDot.connections.length; i++) {
				selfDot.connections[i].redraw();
			}
		}
	});
	this.x = x;
	this.y = y;
	
	//Center Dot
	this.gElement = document.createElementNS(NS, 'g');
	this.gElement.classList.add('centerWrapper');
	this.centerElement = document.createElementNS(NS, 'circle');
	this.centerElement.setAttributeNS(null, 'cx', SVG_SIZE/2);
	this.centerElement.setAttributeNS(null, 'cy', SVG_SIZE/2);
	this.centerElement.setAttributeNS(null, 'r', DOT_RADIUS);
	this.centerElement.setAttributeNS(null, 'fill', 'hsla( ' + definition.hue + ', 100%, ' + DOT_LIGHTNESS + ', 1)');
	this.centerElement.classList.add('dotcenter');
	this.svgElement.classList.add('dotsvg');
	this.centerElement.object = this;
	
	//end Center Dot

	this.arcs = [];
	
	var paramList = definition.parameters
	for (var i = 0; i < paramList.length; i++) {
		var endAngle = 3*Math.PI/2 - i/paramList.length * 2*Math.PI;
		var startAngle = endAngle  - 1/paramList.length * 2*Math.PI;
		if (startAngle < 0) {
			startAngle += 2*Math.PI;
			endAngle += 2*Math.PI;
		}
		this.arcs.push(new arc(this.svgElement, startAngle, endAngle, paramList[i]));
	}
	
	this.gElement.appendChild(this.centerElement);
	
	this.nameElement = document.createElementNS(NS, 'text');
	this.nameElement.setAttributeNS(null, 'x', SVG_SIZE/2);
	this.nameElement.setAttributeNS(null, 'y', SVG_SIZE/2);
	this.nameElement.setAttributeNS(null, 'text-anchor', 'middle');
	this.nameElement.setAttributeNS(null, 'dominant-baseline', 'middle');
	this.nameElement.setAttributeNS(null, 'font-size', DOT_NAME_SIZE);
	this.nameElement.setAttributeNS(null, 'fill', 'black');
	this.nameElement.innerHTML = definition.shortName;
	
	this.gElement.appendChild(this.nameElement);
	this.svgElement.appendChild(this.gElement);
	
	var isOpen = false;
	this.open = function() {
		console.log('open');
		isOpen = true;
		this.svgElement.classList.add('opened');
	}
	this.close = function() {
		console.log('close');
		isOpen = false;
		this.svgElement.classList.remove('opened');
	}
	this.toggle = function() {
		if (isOpen) selfDot.close();
		else selfDot.open();
	}
	
	//events
	var conn = null;
	addListeners(this.centerElement, {
		onHoldStart: function(e) {navigator.vibrate(HOLD_EFFECT_VIBRATE_TIME);},
		onHoldDragStart: function(e) {conn = new connection(selfDot);},
		onHoldDragMove: function(e) {conn.endAt(e.mmX, e.mmY)},
		onDragMove: function(e) {
			Physics.remove(selfDot);
			selfDot.x = e.mmX;
			selfDot.y = e.mmY;
			Physics.add(selfDot);
			//re-render the clipping paths for intersecting arcs
			//TODO: move this to an area that is more generally
			//      about the event "dots moved".
			
			
			
		},
		onHoldDragEnd: function(e) {
			conn.finalize(document.elementFromPoint(e.clientX, e.clientY))
		},
		onTapEnd: function(e) {selfDot.toggle();}
	});
	
	function arc(parent, start, end, definition) {		
		var selfArc = this;
		this.definition = definition;
		this.paramName = definition.name;
		
		var clipPathId = CLIP_PATH_ID++;
		this.gElement = document.createElementNS(NS, 'g');
		this.gElement.classList.add('arcWrapper');
		this.pathElement = document.createElementNS(NS, 'path');
		this.pathElement.classList.add('arc');
		this.pathElement.setAttributeNS(null, 'stroke', 'hsla( 0, 0%, ' + EMPTY_ARC_LIGHTNESS + ', ' + EMPTY_ARC_ALPHA + ')');
		this.pathElement.setAttributeNS(null, 'fill', "none");
		this.pathElement.setAttributeNS(null, 'stroke-width', ARC_WIDTH);
		this.pathElement.setAttributeNS(null, 'clip-path', "url(#clip" + clipPathId + ")");
		
		//Making the path's 'd'
		if( ( end - start ) > 6 /* AKA 2pi */) {	//has one parameter
			var str = "M "+SVG_SIZE/2+" "+(SVG_SIZE/2 - ARC_RADIUS)+"\n";	
			str += "A "+ARC_RADIUS+" "+ARC_RADIUS+" 0 0 0 "+(SVG_SIZE/2)+" "+(SVG_SIZE/2 + ARC_RADIUS)+"\n";
			str += "A "+ARC_RADIUS+" "+ARC_RADIUS+" 0 0 0 "+(SVG_SIZE/2)+" "+(SVG_SIZE/2 - ARC_RADIUS)+"\n";
		} else {	//has 1+ parameters
			var endPoint = polarToCartesian(ARC_RADIUS, end, SVG_SIZE/2, SVG_SIZE/2);
			var startPoint = polarToCartesian(ARC_RADIUS, start, SVG_SIZE/2, SVG_SIZE/2);			
			var str = "M "+endPoint.x+" "+endPoint.y+"\n";
			str += "A "+ARC_RADIUS+" "+ARC_RADIUS+" 0 0 0 "+startPoint.x+" "+startPoint.y+"\n";
		}
		this.pathElement.setAttributeNS(null, 'd', str);
		
		this.clipPathElement = document.createElementNS(NS, 'clipPath');
		this.clipPathElement.setAttributeNS(null, 'id', 'clip'+clipPathId);
		
		this.clipPathsPathElement = document.createElementNS(NS, 'path');
		
		//Making the clipPath's 'd'
		if( ( end - start ) > 6 /* AKA 2pi */) {	//has one parameter
			this.clipOrigin = {x:SVG_SIZE/2 ,y:SVG_SIZE/2};
			var str = "M 0 0\n";
			str += "L "+(SVG_SIZE/2 - GAP_WIDTH/2)+" 0\n";
			str += "L "+(SVG_SIZE/2 - GAP_WIDTH/2)+" "+(SVG_SIZE/2)+"\n";
			str += "L "+(SVG_SIZE/2 + GAP_WIDTH/2)+" "+(SVG_SIZE/2)+"\n";
			str += "L "+(SVG_SIZE/2 + GAP_WIDTH/2)+" 0\n";
			str += "L "+SVG_SIZE+" 0\n";
			str += "L "+SVG_SIZE+" "+SVG_SIZE+"\n";
			str += "L 0 "+SVG_SIZE+"\n";
			//completes back to (0,0)
		} else {	//has 1+ parameters
			var offsetOrigin = polarToCartesian( (GAP_WIDTH/2) / (Math.sin( (end-start)/2) ) , (end+start)/2, SVG_SIZE/2, SVG_SIZE/2);
			this.clipOrigin = offsetOrigin;
			var str = "M "+offsetOrigin.x+" "+offsetOrigin.y+"\n";
			var endPoint = polarToCartesian(SVG_SIZE/2, end, offsetOrigin.x, offsetOrigin.y);
			var startPoint = polarToCartesian(SVG_SIZE/2, start, offsetOrigin.x, offsetOrigin.y);
			str += "L "+endPoint.x+" "+endPoint.y+"\n";
			str += "A "+SVG_SIZE/2+" "+SVG_SIZE/2+" 0 0 0 "+startPoint.x+" "+startPoint.y+"\n";
		}
		this.clipPathsPathElement.setAttributeNS(null, 'd', str);
		
		this.clipPathElement.appendChild(this.clipPathsPathElement);
		
		this.indicatorElement = document.createElementNS(NS, 'path');
		this.indicatorElement.classList.add('arc');
		this.indicatorElement.setAttributeNS(null, 'fill', 'hsla(' + selfArc.definition.hue + ', 100%, ' + FILL_ARC_LIGHTNESS + ', 1)');
		this.indicatorElement.setAttributeNS(null, 'stroke', 'hsla(' + selfArc.definition.hue + ', 100%, ' + STROKE_ARC_LIGHTNESS + ', 1)');
		this.indicatorElement.style['pointer-events'] = 'none';
		function drawIndicator(percent) {
			var str = "M " + selfArc.clipOrigin.x + " " + selfArc.clipOrigin.y;
			var endAngle = start + (end - start)*percent;
			var startAngle = start;
			var endPoint = polarToCartesian(SVG_SIZE/2, endAngle, selfArc.clipOrigin.x, selfArc.clipOrigin.y);
			var startPoint = polarToCartesian(SVG_SIZE/2, startAngle, selfArc.clipOrigin.x, selfArc.clipOrigin.y);
			str += "L "+endPoint.x+" "+endPoint.y+"\n";
			if (endAngle - startAngle > Math.PI) {
				//need 2 arcs, add halfway angle
				var halfwayPoint = polarToCartesian(SVG_SIZE/2, (startAngle+endAngle)/2, selfArc.clipOrigin.x, selfArc.clipOrigin.y);
				str += "A "+SVG_SIZE/2+" "+SVG_SIZE/2+" 0 0 0 "+halfwayPoint.x+" "+halfwayPoint.y+"\n";
			}
			str += "A "+SVG_SIZE/2+" "+SVG_SIZE/2+" 0 0 0 "+startPoint.x+" "+startPoint.y+"\n";
			selfArc.indicatorElement.setAttributeNS(null, 'd', str);
		}
		drawIndicator(.5);
		
		//create our double-clip path
		
		this.doubleClipPathElement = document.createElementNS(NS, 'clipPath');
		this.doubleClipPathsPathElement = document.createElementNS(NS, 'path');
		this.doubleClipPathsPathElement.setAttributeNS(null, 'fill-rule', 'evenodd');
		var str = "M " + (SVG_SIZE/2) + " " + (SVG_SIZE/2 - DOT_RADIUS - GAP_WIDTH) + "\n";
		str += "A " + (DOT_RADIUS+GAP_WIDTH) + " " + (DOT_RADIUS+GAP_WIDTH) + " 0 0 0 " + (SVG_SIZE/2) + " " + (SVG_SIZE/2 + DOT_RADIUS + GAP_WIDTH) + "\n";
		str += "A " + (DOT_RADIUS+GAP_WIDTH) + " " + (DOT_RADIUS+GAP_WIDTH) + " 0 0 0 " + (SVG_SIZE/2) + " " + (SVG_SIZE/2 - DOT_RADIUS - GAP_WIDTH) + "\n";
		str += "M " + (SVG_SIZE/2) + " " + (SVG_SIZE/2 - DOT_RADIUS - GAP_WIDTH - ARC_WIDTH) + "\n";
		str += "A " + (DOT_RADIUS+GAP_WIDTH+ARC_WIDTH) + " " + (DOT_RADIUS+GAP_WIDTH+ARC_WIDTH) + " 0 0 1 " + (SVG_SIZE/2) + " " + (SVG_SIZE/2 + DOT_RADIUS + GAP_WIDTH + ARC_WIDTH) + "\n";
		str += "A " + (DOT_RADIUS+GAP_WIDTH+ARC_WIDTH) + " " + (DOT_RADIUS+GAP_WIDTH+ARC_WIDTH) + " 0 0 1 " + (SVG_SIZE/2) + " " + (SVG_SIZE/2 - DOT_RADIUS - GAP_WIDTH - ARC_WIDTH) + "\n";
		this.doubleClipPathsPathElement.setAttributeNS(null, 'd', str);
		this.doubleClipPathElement.appendChild(this.doubleClipPathsPathElement);
		this.doubleClipPathElement.setAttributeNS(null, 'id', 'doubleClip' + clipPathId);
		this.doubleClipPathElement.setAttributeNS(null, 'clip-path', 'url(#clip'+clipPathId+')');
		this.indicatorElement.setAttributeNS(null, 'clip-path', 'url(#doubleClip' + clipPathId + ')');
		
		
		this.gElement.appendChild(this.doubleClipPathElement);
		this.gElement.appendChild(this.pathElement);
		this.gElement.appendChild(this.indicatorElement);
		this.gElement.appendChild(this.clipPathElement);
		
		parent.appendChild(this.gElement);
		
		function polarToCartesian(radius, angle, originX, originY) {
			return {
				x: originX + radius * Math.cos(angle),
				y: originY + radius * Math.sin(angle)
			}
		}
		function cartesianToPolar(x, y, originX, originY) {
			x -= originX;
			y -= originY;
			return {
				radius: Math.sqrt( x*x + y*y ),
				angle: Math.atan( y / x ) + (x<0) ? Math.PI : 0
			}
		}
		
		
		/**
		 * Using this arc's this.clipOrigin, and a point, figure out the
		 * direction that point is from that origin.
		 *
		 * The x and y coords are in px, where the top left corner of the
		 * document is the origin.
		 *
		 * The clip origin is in mm, and relative to the top left corner
		 * of this arc's SVG.
		 */
		function calculateAngle(x, y) {
			var svg = parent;
			var origin = positionOf(svg);
			origin.x += mmToPx(selfArc.clipOrigin.x);
			origin.y += mmToPx(selfArc.clipOrigin.y);
			
			//now both are relative to top left of doc AND both in px
			var angle = Math.atan((y-origin.y)/(x-origin.x));
			if (x-origin.x < 0) {
				angle += Math.PI;
			}
			if (angle < 0) {
				angle += 2*Math.PI;
			}
			return angle;
		}
		
		/**
		 * Tries to change the position of the arc's value indicator
		 *
		 * The x and y coords are relative to the top left of the doc.
		 */
		function modifyValue(x, y) {
			var angle = calculateAngle(x, y);
			if (angle < start) angle += 2*Math.PI;
			var halfwayAngle = (start+end)/2 + Math.PI;
			if (angle > end) { //if out of range
				if (angle > halfwayAngle) {
					//wrap-around
					angle = start;
				} else {
					angle = end;
				}
			}
			var percent = (angle-start)/(end-start);
			selfDot.node[selfArc.definition.name].value = selfArc.definition.scale(percent);
			drawIndicator(percent);
		}
		
		//arc events
		addListeners(this.pathElement, {
			onTapStart: function(e) {modifyValue(e.pxX, e.pxY);},
			onDragMove: function(e) {modifyValue(e.pxX, e.pxY);},
			onTapEnd:   function(e) {modifyValue(e.pxX, e.pxY);}
		});
	}
	Physics.add(this);
}


/**
 * helper func to get pos of element
 */
function positionOf(element) {
	if (element == document.body) return {x:0, y:0};
	var position = positionOf(element.offsetParent);
	position.x += element.offsetLeft;
	position.y += element.offsetTop;
	return position;
}
