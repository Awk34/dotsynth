//connections!
function Connection(sourceDot) {
	var selfConn = this;
	var parent = this.parentElement = sourceDot.parentElement;
	var source = sourceDot;
	var dest = null;
    this.thisSource = sourceDot;
    this.thisDest = null;
	var endX;
	var endY;
	
	this.svgElement = document.createElementNS(NS, 'svg');
	this.svgElement.classList.add('connectionsvg');
	this.svgElement.style.position = "absolute";
	
	this.lineElement = document.createElementNS(NS, 'path');
	this.lineElement.setAttribute('stroke', 'hsla(' + sourceDot.definition.hue + ', 100%, ' + CONNECTION_LIGHTNESS + ', 1)');
	this.lineElement.setAttribute('fill', "none");
	this.lineElement.setAttribute('stroke-width', CONNECTION_WIDTH);
	
	this.svgElement.appendChild(this.lineElement);
	parent.insertBefore(this.svgElement, parent.firstChild);
	this.redraw = function() {
		var startX = sourceDot.x;
		var startY = sourceDot.y;
		if (dest !== null) {
			endX = dest.x;
			endY = dest.y;
            //console.log(dest);
            //console.log("startX: "+startX+", startY: "+startY+", dest.x: "+dest.x+", dest.y: "+dest.y);
		}
		//draw with startX/Y and endX/Y
		//position SVG
		var width = (Math.abs(startX - endX) + 2*CONNECTION_SVG_PADDING);
		var height = (Math.abs(startY - endY) + 2*CONNECTION_SVG_PADDING);
		this.svgElement.style.left = (Math.min(startX, endX) - CONNECTION_SVG_PADDING) + UNITS;
		this.svgElement.setAttribute('width', width + UNITS);
		this.svgElement.style.top = (Math.min(startY, endY) - CONNECTION_SVG_PADDING) + UNITS;
		this.svgElement.setAttribute('height', height + UNITS);
		this.svgElement.setAttribute('viewBox', '0 0 ' + (Math.abs(startX - endX) + 2*CONNECTION_SVG_PADDING) + ' ' + (Math.abs(startY - endY) + 2*CONNECTION_SVG_PADDING));
	
		//draw line
		var str = "M " + (startX < endX ? CONNECTION_SVG_PADDING : width-CONNECTION_SVG_PADDING) + " " + (startY < endY ? CONNECTION_SVG_PADDING : height-CONNECTION_SVG_PADDING) + "\n";
		str += "L " + (startX > endX ? CONNECTION_SVG_PADDING : width-CONNECTION_SVG_PADDING) + " " + (startY > endY ? CONNECTION_SVG_PADDING : height-CONNECTION_SVG_PADDING) + "\n";
		this.lineElement.setAttribute('d', str);
	};
	
	this.endAt = function(x,y) {
		endX = x;
		endY = y;
		this.redraw();
	};
	this.finalize = function(target) {
		//if .object has a dot attached to it, and if it can take input...
		if (target.object && Object.getPrototypeOf(target.object) == Dot.prototype && target.object != source && target.object.definition.canTakeInput) {
			//console.log(target.object);
            dest = target.object;
            this.thisDest = target.object;
			source.connections.push(this);
			dest.connections.push(this);
            undoStack.push(new Action(this, "connect"));
			source.node.connect(dest.node);
			this.redraw();
		} else {
			if(target.object && !target.object.definition.canTakeInput) {
				//The destination node doesn't take input
				//TODO: Display error to user (popup?)
				console.log("Illegal Connection: Destination has no inputs");
			}
			parent.removeChild(this.svgElement);
		}
	}
}