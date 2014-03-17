var dotList = [];
/**
 * Creates a new dot with all of its DOM elements
 */
function Dot(definition, x, y) {
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
	this.svgElement.setAttributeNS(null, 'id', Math.floor(Math.random()*1000000000));
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
	this.gCenterElement = document.createElementNS(NS, 'g');
	this.gCenterElement.classList.add('centerWrapper');
	this.centerElement = document.createElementNS(NS, 'circle');
	this.centerElement.setAttributeNS(null, 'cx', SVG_SIZE/2);
	this.centerElement.setAttributeNS(null, 'cy', SVG_SIZE/2);
	this.centerElement.setAttributeNS(null, 'r', DOT_RADIUS);
	this.centerElement.classList.add('dotcenter');
	this.centerElement.classList.add(definition.className);
	this.svgElement.classList.add('dotsvg');
	this.centerElement.object = this;
	//end Center Dot
	
	this.arcsClipPath = document.createElementNS(NS, 'clipPath');
	this.arcsClipPath.id = 'arcsClipPath' + CLIP_PATH_ID++;
	this.svgElement.appendChild(this.arcsClipPath);
	
	this.gArcsElement = document.createElementNS(NS, 'g');
	this.gArcsElement.classList.add('arcsWrapper');
	this.gArcsElement.setAttributeNS(null, 'clip-path', "url(#" + this.arcsClipPath.id + ")");
	this.svgElement.appendChild(this.gArcsElement);
	
	this.arcs = [];
	
	var paramList = definition.parameters
	for (var i = 0; i < paramList.length; i++) {
		var endAngle = 3*Math.PI/2 - i/paramList.length * 2*Math.PI;
		var startAngle = endAngle  - 1/paramList.length * 2*Math.PI;
		if (startAngle < 0) {
			startAngle += 2*Math.PI;
			endAngle += 2*Math.PI;
		}
		this.arcs.push(new Arc(this.gArcsElement, startAngle, endAngle, paramList[i]));
		
	}
	
	this.gCenterElement.appendChild(this.centerElement);
	
	this.nameElement = document.createElementNS(NS, 'text');
	this.nameElement.setAttributeNS(null, 'x', SVG_SIZE/2);
	this.nameElement.setAttributeNS(null, 'y', SVG_SIZE/2);
	this.nameElement.setAttributeNS(null, 'text-anchor', 'middle');
	this.nameElement.setAttributeNS(null, 'dominant-baseline', 'middle');
	this.nameElement.setAttributeNS(null, 'font-size', DOT_NAME_SIZE);
	this.nameElement.setAttributeNS(null, 'fill', 'black');
	this.nameElement.innerHTML = definition.shortName;
	
	this.gCenterElement.appendChild(this.nameElement);
	this.svgElement.appendChild(this.gCenterElement);
	
	this.isOpen = false;
	this.open = function() {
		if (selfDot.arcs.length == 0) return;
		selfDot.isOpen = true;
		this.svgElement.classList.add('opened');
		updateArcsClipPath();
	}
	this.close = function() {
		selfDot.isOpen = false;
		this.svgElement.classList.remove('opened');
		updateArcsClipPath();
	}
	this.toggle = function() {
		if (selfDot.isOpen) selfDot.close();
		else selfDot.open();
	}
	
	//events
	var conn = null;
	addListeners(this.centerElement, {
		onHoldStart: function(e) {navigator.vibrate(HOLD_EFFECT_VIBRATE_TIME);},
		onHoldDragStart: function(e) {conn = new Connection(selfDot);},
		onHoldDragMove: function(e) {conn.endAt(e.mmX, e.mmY)},
		onDragStart: function(e) {
			//move to front
			selfDot.svgElement.parentNode.appendChild(selfDot.svgElement);
			if (!CONTINUOUS_PHYSICS) {
				Physics.remove(selfDot);
				updateArcsClipPath();
			}
		},
		onDragMove: function(e) {
			if (CONTINUOUS_PHYSICS)
				Physics.remove(selfDot);
			selfDot.x = e.mmX;
			selfDot.y = e.mmY;
			if (CONTINUOUS_PHYSICS) {
				Physics.add(selfDot);
				updateArcsClipPath();
			}
			//re-render the clipping paths for intersecting arcs
			//TODO: move this to an area that is more generally
			//      about the event "dots moved".
		},
		onDragEnd: function(e) {
			if (!CONTINUOUS_PHYSICS) {
				Physics.add(selfDot);
				updateArcsClipPath();
			}
		},
		onHoldDragEnd: function(e) {
			conn.finalize(document.elementFromPoint(e.clientX, e.clientY))
		},
		onTapEnd: function(e) {selfDot.toggle();}
	});
	
	function Arc(parent, start, end, definition) {
		var selfArc = this;
		this.definition = definition;
		this.paramName = definition.name;
		
		var clipPathId = CLIP_PATH_ID++;
		this.gElement = document.createElementNS(NS, 'g');
		this.gElement.classList.add('arcWrapper');
		this.pathElement = document.createElementNS(NS, 'path');
		this.pathElement.classList.add('arc');
		this.pathElement.classList.add('empty');
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
		this.indicatorElement.classList.add(definition.className);
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
		//set default arc position to 50%
		// drawIndicator(.5);
		//set default arc position to its node's default value's position
		drawIndicator(selfArc.definition.invScale(selfDot.node[selfArc.definition.name].value));
		
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

		this.invModifyValue = function(value) {
			selfDot.node[selfArc.definition.name].value = value;
			// console.log("Percent: "+selfArc.definition.invScale(value));
			// console.log("Definition: "+selfArc.definition.name);
			drawIndicator(selfArc.definition.invScale(value));
		}
		
		//arc events
		addListeners(this.pathElement, {
			onTapStart: function(e) {modifyValue(e.pxX, e.pxY);},
			onDragMove: function(e) {modifyValue(e.pxX, e.pxY);},
			onTapEnd:   function(e) {modifyValue(e.pxX, e.pxY);}
		});
	}
	Physics.add(this);
	function updateArcsClipPath() {
		//update EVERY dot. we're assuming that they all changed a little
		//not the best assumption...
		for (var i = 0; i < dotList.length; i++) {
			var current = dotList[i];
			current.arcsClipPath.innerHTML = '';
			var others = Physics.adjacentTo(current);
			
			//start with SVG's bounding box...
			var points = [
				{x:0,y:0},
				{x:SVG_SIZE,y:0},
				{x:SVG_SIZE,y:SVG_SIZE},
				{x:0,y:SVG_SIZE}
			];
			
			//...and cut away at it.
			if (current.isOpen && Physics.hasDot(current)) {
				for (var j = 0; j < others.length; j++) {
					var other = others[j];
					if (!other.isOpen) continue;
					//slice the clip path into 2 convex polygons,
					//then check to see which is the one we want.
					var dx = (other.x - current.x)/2;
					var dy = (other.y - current.y)/2;
					//reduce the distance by GAP_WIDTH/2;
					var len = Math.sqrt(dx*dx+dy*dy);
					var newlen = len - GAP_WIDTH/2;
					dx *= newlen/len;
					dy *= newlen/len;
					
					var cut1 = {
						x: SVG_SIZE/2 + dx,
						y: SVG_SIZE/2 + dy
					}
					var cut2 = {
						x: SVG_SIZE/2 + dx+dy,
						y: SVG_SIZE/2 + dy-dx
					}
					var intersections = [];
					for (var k = 0; k < points.length; k++) {
						var p1 = points[k];
						var p2 = points[(k+1)%points.length];
						//intersection finder:
						var x1 = cut1.x, y1 = cut1.y, x2 = cut2.x, y2 = cut2.y,
							x3 = p1.x, y3 = p1.y, x4 = p2.x, y4 = p2.y;
						var intersection = {
							x: ( (x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4) )/( (x1-x2)*(y3-y4)-(y1-y2)*(x3-x4) ),
							y: ( (x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4) )/( (x1-x2)*(y3-y4)-(y1-y2)*(x3-x4) )
						}
						var isYDiffGreater = Math.abs(p2.y-p1.y) > Math.abs(p2.x-p1.x);
						if (	(!isYDiffGreater && (intersection.x < p1.x ^ intersection.x < p2.x) )
							||	( isYDiffGreater && (intersection.y < p1.y ^ intersection.y < p2.y) ) ) {
							//at this line segment following point k, there is an intersection.
							intersections.push({intersection:intersection, k:k});
						}
					}
					//if there were 2 intersections, perform the cut
					if (intersections.length === 2) {
						var result = [];
						//the intersection points
						var i1 = intersections[0].intersection;
						var i2 = intersections[1].intersection;
						//the indexes of the line segments that they intersected
						var k1 = intersections[0].k;
						var k2 = intersections[1].k;
						
						var isLeft = ((i2.x - i1.x)*(SVG_SIZE/2 - i1.y) - (i2.y - i1.y)*(SVG_SIZE/2 - i1.x)) < 0;
						if (isLeft) {
							//go from k1's line to k2's line
							result.push(i1);
							for (var k = k1+1; k <= k2; k++) {
								result.push(points[k]);
							}
							result.push(i2);
						} else {
							//go from k2's line to k1's line
							result.push(i2);
							for (var k = (k2+1)%points.length; k != (k1+1)%points.length; k = (k+1)%points.length) {
								result.push(points[k]);
							}
							result.push(i1);
						}
						points = result;
					}
				}
			}
			//now that points[] represents the clipPath we want, generate that clipPath
			var str = 'M ' + points[0].x + ' ' + points[0].y;
			for (var j = 1; j < points.length; j++) {
				str += 'L ' + points[j].x + ' ' + points[j].y;
			}
			var path = document.createElementNS(NS, 'path');
			path.setAttributeNS(null, 'd', str);
			current.arcsClipPath.appendChild(path);
		}
	}
	updateArcsClipPath();
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
