var NS = 'http://www.w3.org/2000/svg'
var UNITS = 'mm';
var DOT_RADIUS = 10;
var SVG_SIZE = 100;
var GAP_WIDTH = 2;
var ARC_WIDTH = 18;
var ARC_RADIUS = DOT_RADIUS + GAP_WIDTH + ARC_WIDTH/2;
var CLIP_PATH_ID = 0;
var EMPTY_ARC_LIGHTNESS = '40%';
var EMPTY_ARC_ALPHA = .5;
var FILL_ARC_LIGHTNESS = '30%';
var STROKE_ARC_LIGHTNESS = '50%';
var TAP_TIMEOUT = 200;
var DRAG_BOX_SIZE = 10; //in mm
var HOLD_EFFECT_VIBRATE_TIME = 100;
var CONNECTION_WIDTH = 2;
var CONNECTION_SVG_PADDING = 5;
var DOT_NAME_SIZE = 7;

var DOT_LIGHTNESS = "30%";
var CONNECTION_LIGHTNESS = "30%";
var INDICATOR_LIGHTNESS = "50%"

//physics
var DOT_PHYSICS_RADIUS = DOT_RADIUS + ARC_WIDTH/2 + GAP_WIDTH;
var GRID_SIZE = DOT_PHYSICS_RADIUS*1.4;

var CONTINUOUS_PHYSICS = false;
var nodeArray = [];
