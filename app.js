const REFRESH_RATE = 250; // Milliseconds

// Checkbox [L/R]
async function changeMode() {
  let stereoMode = document.querySelector("#stereoMode").checked;
  let audioInputs = (stereoMode)?await Plotter.getStereoAudioInputs() : await Plotter.getAudioInputs();

  //Update Input Devices List
  let inputDropdown = document.querySelector("#inputs");
  inputDropdown.length = 0;
  for (let i = 0; i < audioInputs.length; i++) {
    var inputItem = document.createElement("option");
    inputItem.value = audioInputs[i].deviceId;
    inputItem.text = audioInputs[i].label;
    inputDropdown.options.add(inputItem);
  }

}

function refreshDisplays() {
  if (window.plotter.active) {
    //requestAnimationFrame(refreshDisplays);
    setTimeout(() => {
      refreshDisplays();
    }, REFRESH_RATE);
    window.plotter.updateDisplays();
  }
}

// Button [Start]
async function start() {
  let btn = document.querySelector("#btnStart");
  if (btn.innerText == "Start") {
    //Init AudioContext and Plotter if not already
    if (!window.plotter) {
      if (!window.audioCtx) {
        window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      window.plotter = new Plotter(window.audioCtx, document.getElementById("waveform"), document.getElementById("phase"), document.getElementById("frequency"));
    }

    //Init input(s)
    let selectedInput = document.querySelector("#inputs").value;
    let stereoMode = document.querySelector("#stereoMode").checked;
    if (stereoMode) {
      //Stereo mode
      await window.plotter.startStereo(selectedInput);
    }
    else {
      //Mono mode
      if (window.signalGenerator?.active) {
        //Signal Generator is running
        await window.plotter.start(selectedInput, window.signalGenerator);
      } else {
        //Signal Generator is not running
        await window.plotter.start(selectedInput);
      }
    }
    refreshDisplays();

    btn.innerText = "Stop";
    document.querySelector("#btnPause").disabled = false;
  } else {
    try {
      //Stopping
      window.plotter.stop();

      btn.innerText = "Start";
      document.querySelector("#btnPause").innerText = "Pause";
      document.querySelector("#btnPause").disabled = true;    
    } catch (error) {
      alert(error);
    }
  }
}

// Button [Pause]
function pause() {
  let btn = document.querySelector("#btnPause");
  if (btn.innerText == "Pause") {
    //Pause
    window.plotter.pause();
    btn.innerText = "Resume";
  } else {
    //Resume
    window.plotter.resume();
    btn.innerText = "Pause";
  }
}

// Button [Offset]
function offset() {
  let offsetValue = document.querySelector("#offset").value;
  window.plotter?.setOffset(offsetValue - 512);
}

function offsetPlus() {
  let offsetValue = parseInt(document.querySelector("#offset").value);
  document.querySelector("#offset").value = offsetValue + 1;
  offset();
}

function offsetMinus() {
  let offsetValue = parseInt(document.querySelector("#offset").value);
  document.querySelector("#offset").value = offsetValue - 1;
  offset();
}

function zoomL() {
  let zoomValue = document.querySelector("#lZoom").value / 20;
  window.plotter?.zoomL(zoomValue);
}

function zoomR() {
  let zoomValue = document.querySelector("#rZoom").value / 20;
  window.plotter?.zoomR(zoomValue);
}

function reset() {
  document.querySelector("#offset").value = 512;
  document.querySelector("#lZoom").value = 20;
  document.querySelector("#rZoom").value = 20;
  offset();
  zoomL();
  zoomR();
}

// Button [Play] (Signal generator)
function play() {
  let btn = document.querySelector("#btnPlay");
  if (btn.innerText == "Play") {
    //Get signal type
    let signalType = "sine";
    document.getElementsByName("signalType").forEach((radioBtn) => {
      if (radioBtn.checked) {
        signalType = radioBtn.value;
      }
    });
    let freq = parseInt(document.querySelector("#sigFreq").value);
    let gain = parseInt(document.querySelector("#sigAmp").value) / 100;

    //Start Signal Generator
    if (!window.signalGenerator) {
      if (!window.audioCtx) {
        window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      window.signalGenerator = new SignalGenerator(window.audioCtx, signalType, freq, gain);
    }

    //Connect to Plotter's lAnalyzer if in mono mode
    if (window.plotter?.lAnalyser) {
      let stereoMode = document.querySelector("#stereoMode").checked;
      if (!stereoMode) {
        window.signalGenerator.connectAnalyser(window.plotter.lAnalyser);
      }
    }
    window.signalGenerator.start();

    document.querySelector("#btnImpulse").disabled = true;
    btn.innerText = "Stop";
  } else {
    //Stop Signal Generator
    window.signalGenerator?.stop();

    document.querySelector("#btnImpulse").disabled = false;
    btn.innerText = "Play";
  }
}

// Button [Set] (Frequency)
function setFreq() {
  let freq = parseInt(document.querySelector("#sigFreq").value);
  window.signalGenerator?.changeFrequency(freq);
}

function changeAmp() {
  let gain = parseInt(document.querySelector("#sigAmp").value) / 100;
  window.signalGenerator?.changeAmplitude(gain);
}

function changeType(signalType) {
  window.signalGenerator?.changeSignalType(signalType);
}

function impulse() {
  alert("Not Implemented!");
}

// Initialize Application
async function initApp() {
  //Update Input Devices List
  let audioInputs = await Plotter.getAudioInputs();
  let inputDropdown = document.querySelector("#inputs");
  for (let i = 0; i < audioInputs.length; i++) {
    var inputItem = document.createElement("option");
    inputItem.value = audioInputs[i].deviceId;
    inputItem.text = audioInputs[i].label;
    inputDropdown.options.add(inputItem);
  }

  //Init Displays
  new Display(document.getElementById("phase")).renderWaveform();
  new Display(document.getElementById("waveform")).renderWaveform();
  new Display(document.getElementById("frequency")).renderWaveform();
}