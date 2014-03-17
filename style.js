/**
 * The purpose of this script is to generate
 * stylesheets from constant global variables,
 * or from user configurations.
 *
 * If ever any dimensions change, they only need
 * to be changed in one place, rather than
 * changing many CSS rules and declarations.
 */
(function() {
	var styleSheet = document.createElement('style');
	document.head.appendChild(styleSheet);
	styleSheet.appendChild(document.createTextNode('')); //compatibility hack
	styleSheet = styleSheet.sheet;

	for (var i in DOT_LIST) {
		//TODO: move .dotcenter and .arc (and other classes) to globals,
		//      to be used as identifier constants, rather than
		//      magic strings.
		//dot center styles
		var dotDef = DOT_LIST[i];
		styleSheet.insertRule("\
			.dotcenter." + dotDef.className + " {\
				fill: hsla(" + dotDef.hue + "," + DOT_SATURATION + "," + DOT_LIGHTNESS + "," + DOT_ALPHA + ");\
			}\
		", 0);
		
		//arc/param styles
		for (var j in dotDef.parameters) {
			var paramDef = dotDef.parameters[j];
			styleSheet.insertRule("\
				.arc." + paramDef.className + "{\
					stroke: hsla(" + paramDef.hue + ","  + INDICATOR_ARC_SATURATION + ","  + INDICATOR_ARC_LIGHTNESS + "," + INDICATOR_ARC_ALPHA + ");\
					fill: hsla(" + paramDef.hue + ","  + FILL_ARC_SATURATION + ","  + FILL_ARC_LIGHTNESS + "," + FILL_ARC_ALPHA + ");\
					stroke-width: " + GAP_WIDTH + ";\
				}\
			", 0);
		}
	}
	
	//empty arc styles
	styleSheet.insertRule("\
		.arc.empty {\
			stroke: hsla(" + EMPTY_ARC_HUE + "," + EMPTY_ARC_SATURATION + "," + EMPTY_ARC_LIGHTNESS + "," + EMPTY_ARC_ALPHA + ");\
			fill: none;\
			stroke-width: " + ARC_WIDTH + ";\
		}\
	", 0);
})();