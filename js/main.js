window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
context.destination.connections = [];

helptext = document.getElementById('helptext');
help = document.getElementById('help');
addListeners(helptext, {onTapEnd: function() {
    classie.toggleClass(helptext, 'hidden'); }
});
addListeners(help, {onTapEnd: function() {
    classie.toggleClass(helptext, 'hidden'); }
});