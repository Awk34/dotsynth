var newDotMenu = document.createElementNS(NS, 'svg');
newDotMenu.style.display = "none";
newDotMenu.style.position = "absolute";
document.body.appendChild(newDotMenu);
var isVisible = false;
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
