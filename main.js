window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
context.destination.connections = [];


// for help menu box, toggles display on/off
function toggle(obj) {
    var el = document.getElementById(obj);
	if(el.style.display == 'none')
		el.style.display = '';
	else
		el.style.display = 'none';
}