//connections! 
function connection(sourceDot) {
	var selfConn = this;
	var parent = this.parentElement = sourceDot.parentElement;
	var source = sourceDot;
	var dest = null;
	//sourceDot.connections.push(this);
	//destDot.connections.push(this);
	var endX;
	var endY;
	
	this.svgElement = document.createElementNS(NS, 'svg');
	this.svgElement.classList.add('connectionsvg');
	this.svgElement.style.position = "absolute";
	
	this.lineElement = document.createElementNS(NS, 'path');
	this.lineElement.setAttributeNS(null, 'stroke', 'hsla(' + sourceDot.definition.hue + ', 100%, ' + CONNECTION_LIGHTNESS + ', 1)');
	this.lineElement.setAttributeNS(null, 'fill', "none");
	this.lineElement.setAttributeNS(null, 'stroke-width', CONNECTION_WIDTH);
	
	this.svgElement.appendChild(this.lineElement);
	parent.insertBefore(this.svgElement, parent.firstChild);
	this.redraw = function() {
		var startX = sourceDot.x;
		var startY = sourceDot.y;
		if (dest !== null) {
			endX = dest.x;
			endY = dest.y;
		}
		//draw with startX/Y and endX/Y
		//position SVG
		var width = (Math.abs(startX - endX) + 2*CONNECTION_SVG_PADDING);
		var height = (Math.abs(startY - endY) + 2*CONNECTION_SVG_PADDING);
		this.svgElement.style.left = (Math.min(startX, endX) - CONNECTION_SVG_PADDING) + UNITS;
		this.svgElement.setAttributeNS(null, 'width', width + UNITS);
		this.svgElement.style.top = (Math.min(startY, endY) - CONNECTION_SVG_PADDING) + UNITS;
		this.svgElement.setAttributeNS(null, 'height', height + UNITS);
		this.svgElement.setAttributeNS(null, 'viewBox', '0 0 ' + (Math.abs(startX - endX) + 2*CONNECTION_SVG_PADDING) + ' ' + (Math.abs(startY - endY) + 2*CONNECTION_SVG_PADDING));
	
		//draw line
		var str = "M " + (startX < endX ? CONNECTION_SVG_PADDING : width-CONNECTION_SVG_PADDING)
				+ " " + (startY < endY ? CONNECTION_SVG_PADDING : height-CONNECTION_SVG_PADDING) + "\n";
		str += "L " + (startX > endX ? CONNECTION_SVG_PADDING : width-CONNECTION_SVG_PADDING)
				+ " " + (startY > endY ? CONNECTION_SVG_PADDING : height-CONNECTION_SVG_PADDING) + "\n";
		this.lineElement.setAttributeNS(null, 'd', str);
	}
	
	this.endAt = function(x,y) {
		endX = x;
		endY = y;
		this.redraw();
	}
	this.finalize = function(target) {
		//if .object has a dot attached to it...
		if (target.object && Object.getPrototypeOf(target.object) == dot.prototype && target.object != source) {
			dest = target.object;
			source.connections.push(this);
			dest.connections.push(this);
			source.node.connect(dest.node);
			this.redraw();
		} else {
			parent.removeChild(this.svgElement);
		}
	}
}