window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

addListeners(helptext, {onTapEnd: function(){ helptext.classList.toggle('hidden'); }});
addListeners(help, {onTapEnd: function(){ helptext.classList.toggle('hidden'); }});
// addListeners(oscTypeMenu, {onTapEnd: function(){ oscTypeMenu.classList.toggle('hidden'); }});