(function() {
	var DOT_PHYSICS_RADIUS = 20;
	var GRID_SIZE = DOT_PHYSICS_RADIUS*1.4;
	
	//triple array.
	//for every X, an array of Y's
		//every Y, a dot, or nothing
	var grid = [];
	
	function indexOf(val) {
		return Math.floor(val/GRID_SIZE);
	}
	function getDotAtIndex(x, y) {
		if (grid[x] === undefined) grid[x] = [];
		return grid[x][y];
	}
	function getDotAtCoords(x, y) {
		return getDotAtIndex(indexOf(x), indexOf(y));
	}
	
	function setDotAtIndex(dot, x, y) {
		if (grid[x] === undefined) grid[x] = [];
		grid[x][y] = dot;
	}
	function setDotAtCoords(dot, x, y) {
		setDotAtIndex(dot, indexOf(x), indexOf(y));
	}
	
	
	function adjacentCandidates(x, y) {
		var xMin = indexOf(x-DOT_PHYSICS_RADIUS*2);
		var xMax = indexOf(x+DOT_PHYSICS_RADIUS*2);
		var yMin = indexOf(y-DOT_PHYSICS_RADIUS*2);
		var yMax = indexOf(y+DOT_PHYSICS_RADIUS*2);
		var returnList = [];
		for (var xi = xMin; xi <= xMax; xi++) {
			for (var yi = yMin; yi <= yMax; yi++) {
				var dot = getDotAtIndex(xi,yi);
				if (dot !== undefined)
					returnList.push(dot);
			}
		}
		return returnList;
	}
	function addDot(dot) {
		var adj = adjacentCandidates(dot.x, dot.y);
		for (var i = 0; i < adj.length; i++) {
			var dx = adj[i].x-dot.x;
			var dy = adj[i].y-dot.y;
			var distance = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2))
			if (distance <= DOT_PHYSICS_RADIUS*2) {
				removeDot(adj[i]);
				var scale = DOT_PHYSICS_RADIUS*2.001/distance;
				dx *= scale;
				dy *= scale;
				adj[i].x = dot.x + dx;
				adj[i].y = dot.y + dy;
				addDot(adj[i]);
			}
		}
		var x = indexOf(dot.x);
		var y = indexOf(dot.y);
		if (grid[x] === undefined) grid[x] = [];
		grid[x][y] = dot;
		return dot;
	}
	function removeDot(dot) {
		if (getDotAtCoords(dot.x, dot.y) === dot)
			setDotAtCoords(undefined, dot.x, dot.y);
	}
	function adjacentDots(dot) {
		var drawRadius = DOT_RADIUS + GAP_WIDTH + ARC_WIDTH + GAP_WIDTH/2;
		var xMin = indexOf(dot.x-drawRadius*2);
		var xMax = indexOf(dot.x+drawRadius*2);
		var yMin = indexOf(dot.y-drawRadius*2);
		var yMax = indexOf(dot.y+drawRadius*2);
		var returnList = [];
		for (var xi = xMin; xi <= xMax; xi++) {
			for (var yi = yMin; yi <= yMax; yi++) {
				var other = getDotAtIndex(xi,yi);
				if (other !== undefined && dot !== other) {
					var dx = dot.x-other.x;
					var dy = dot.y-other.y;
					var distance = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
					if (distance <= DOT_PHYSICS_RADIUS*2) {
						returnList.push(other);
					}
				}
			}
		}
		return returnList;
	}
	Physics = {
		add: addDot,
		remove: removeDot,
		adjacentTo: adjacentDots
	}
})();