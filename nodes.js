var DOT_LIST = [
	{
		name: "Output",
		shortName: "Out",
		canTakeInput: true,
		create: function() {
			var tmp = context.destination;
			tmp.connections = [];
			return tmp;
		},
		//huehuehue
		hue: 300,
		parameters: []
	},
	{
		name: "Oscillator",
		shortName: "Osc",
		canTakeInput: false,
		create: function() {
			var tmp = context.createOscillator();
			tmp.type = "square";
			//console.log(typeof(tmp.type));
			tmp.start(0);
			return tmp;
		},
		hue: 180,
		parameters: [
			{
				name: "detune",
				scale: function(percent) {
					return (percent*1000)-100;
				},
				hue: 210
			},
			{
				name: "frequency",
				scale: function(percent) {
					var d = Math.floor(128*percent);
					var f = Math.pow(2,(d-69)/12)*440;
					return f;
				},
				hue: 210
			}
		]
	},
	{
		name: "Low Frequency Oscillator",
		shortName: "LFO",
		canTakeInput: false,
		create: function() {
			var tmp = context.createOscillator();
			tmp.start(0);
			return tmp;
		},
		hue: 240,
		parameters: [
			{
				name: "frequency",
				scale: function(percent) {
					var d = Math.floor(128*percent);
					var f0 = Math.pow(2,(d-69)/12)*60;
					return f0;
				},
				hue: 210
			}
		]
	},
	{
		name: "Gain",
		shortName: "Gain",
		canTakeInput: true,
		create: function() {
			return context.createGain();
		},
		hue: 0,
		parameters: [
			{
				name: "gain",
				scale: function(percent) {
					return percent;
				},
				hue: 0
			}
		]
	},
	{
		name: "Delay",
		shortName: "Delay",
		canTakeInput: true,
		create: function() {
			return context.createDelay();
		},
		hue: 30,
		parameters: [
			{
				name: "delayTime",
				scale: function(percent) {
					//min: 0.0, max: 1.0
					return percent;
				},
				hue: 60
			}
		]
	},
	/*{
		name: "AudioSourceNode",
		shortName: "Src",
		canTakeInput: false,
		create: function() {
			this.audioPlayer = new newAudioTag();
			this.audioPlayer.source = context.createMediaElementSource(this.audioPlayer.audio);
			this.audioPlayer.play();
			//audioPlayer.play("chrono.mp3");
			//var mediaElement = document.getElementById('audioFileId');
			return this.audioPlayer.source;
		},
		hue: 45,
		parameters: [

		]
	},*/
	{
		name: "Compressor",
		shortName: "Comp",
		canTakeInput: true,
		create: function() {
			return context.createDynamicsCompressor();
		},
		hue: 100,
		parameters: [
			{
				// threshold
				// The decibel value above which the compression will start taking effect. Its default value is -24, with a nominal range of -100 to 0.
				name: "threshold",
				scale: function(percent) {
					return (percent-1)*100;
				},
				hue: 120
			},
			{
				// knee
				// A decibel value representing the range above the threshold where the curve smoothly transitions to the "ratio" portion. Its default value is 30, with a nominal range of 0 to 40.
				name: "knee",
				scale: function(percent) {
					return percent*40;
				},
				hue: 120
			},
			{
				// ratio
				// The amount of dB change in input for a 1 dB change in output. Its default value is 12, with a nominal range of 1 to 20.
				name: "ratio",
				scale: function(percent) {
					return percent*20;
				},
				hue: 120
			},
			/*{
				// reduction
				// A read-only decibel value for metering purposes, representing the current amount of gain reduction that the compressor is applying to the signal. If fed no signal the value will be 0 (no gain reduction). The nominal range is -20 to 0.
				name: "reduction",
				scale: function(percent) {
					return (percent-1)*20;
				},
				hue: 120
			},*/
			{
				// attack
				// The amount of time (in seconds) to reduce the gain by 10dB. Its default value is 0.003, with a nominal range of 0 to 1.
				name: "attack",
				scale: function(percent) {
					return percent;
				},
				hue: 120
			},
			{
				// release
				// The amount of time (in seconds) to increase the gain by 10dB. Its default value is 0.250, with a nominal range of 0 to 1.
				name: "release",
				scale: function(percent) {
					return percent;
				},
				hue: 120
			}
		]
	},
	/*{
		name: "Panner",
		shortName: "Pan",
		canTakeInput: true,
		create: function() {
			return context.createPanner();
		},
		hue: 330,
		parameters: [

		]
	},*/
	/*{
		name: "Convolver",
		shortName: "Conv",
		canTakeInput: true,
		create: function() {
			return context.createConvolver();
		},
		hue: 330,
		parameters: [
			{
				name: "",
				scale: function(percent) {
					return percent;
				},
				hue: 120
			}
		]
	}*/
]



//Microphone input stuff
function MicrophoneSample() {
  this.WIDTH = 640;
  this.HEIGHT = 480;
  this.getMicrophoneInput();
  this.canvas = document.querySelector('canvas');
}

MicrophoneSample.prototype.getMicrophoneInput = function() {
  navigator.webkitGetUserMedia({audio: true},
                               this.onStream.bind(this),
                               this.onStreamError.bind(this));
};

MicrophoneSample.prototype.onStream = function(stream) {
  var input = context.createMediaStreamSource(stream);
  var filter = context.createBiquadFilter();
  filter.frequency.value = 60.0;
  filter.type = filter.NOTCH;
  filter.Q = 10.0;

  var analyser = context.createAnalyser();

  // Connect graph.
  input.connect(filter);
  filter.connect(analyser);

  this.analyser = analyser;
  // Setup a timer to visualize some stuff.
  requestAnimFrame(this.visualize.bind(this));
};

MicrophoneSample.prototype.onStreamError = function(e) {
  console.error('Error getting microphone', e);
};

MicrophoneSample.prototype.visualize = function() {
  this.canvas.width = this.WIDTH;
  this.canvas.height = this.HEIGHT;
  var drawContext = this.canvas.getContext('2d');

  var times = new Uint8Array(this.analyser.frequencyBinCount);
  this.analyser.getByteTimeDomainData(times);
  for (var i = 0; i < times.length; i++) {
    var value = times[i];
    var percent = value / 256;
    var height = this.HEIGHT * percent;
    var offset = this.HEIGHT - height - 1;
    var barWidth = this.WIDTH/times.length;
    drawContext.fillStyle = 'black';
    drawContext.fillRect(i * barWidth, offset, 1, 1);
  }
  requestAnimFrame(this.visualize.bind(this));
};



//Audio File Stuff
function newAudioTag() {
  // Create a new <audio> tag.
  this.audio = new Audio();

  // Note: the audio graph must be connected after the page is loaded.
  // Otherwise, the Audio tag just plays normally and ignores the audio
  // context. More info: crbug.com/112368
  window.addEventListener('load', this.onload.bind(this), false);
}

newAudioTag.prototype.onload = function() {
	// Create the audio nodes.
	this.source = context.createMediaElementSource(this.audio);
	this.filter = context.createBiquadFilter();
	this.filter.type = this.filter.LOWPASS;
	this.filter.frequency.value = 500;

	// Connect the audio graph.
	this.source.connect(this.filter);
	this.filter.connect(context.destination);
};

newAudioTag.prototype.play = function(url) {
  this.audio.src = url;
  this.audio.play();
};