const LEFT_CHANNEL_COLOR = "rgb(255, 0, 0)";
const RIGHT_CHANNEL_COLOR = "rgb(0, 0, 255)";
const RESPONSE_COLOR = "rgb(0, 255, 0)";
const REFRESH_RATE = 150; // Milliseconds

// Start Monitoring selected input
async function startMonitor() {
  let selectedInput = document.querySelector("#inputs").value;
  let mon = await MonitorChannel.createMonitorChannel(selectedInput);
  window.monChannel = mon;

  let wPlotter = new Plotter(document.getElementById("waveform"), mon.lAnalyser.frequencyBinCount, LEFT_CHANNEL_COLOR, RIGHT_CHANNEL_COLOR);
  let fPlotter = new Plotter(document.getElementById("frequency"), mon.lAnalyser.frequencyBinCount, LEFT_CHANNEL_COLOR, RIGHT_CHANNEL_COLOR);
  let rPlotter = new Plotter(document.getElementById("response"), mon.lAnalyser.frequencyBinCount, LEFT_CHANNEL_COLOR, RIGHT_CHANNEL_COLOR);
  let offsetValue = document.querySelector("#offset").value;
  wPlotter.setOffset(offsetValue);
  fPlotter.setOffset(offsetValue);
  rPlotter.setOffset(offsetValue);  
  window.wPlotter = wPlotter;
  window.fPlotter = fPlotter;
  window.rPlotter = rPlotter;
  
  function updateAnalyser() {
    if (window.monChannel.active) {
      //requestAnimationFrame(updateAnalyser);
      setTimeout(() => {
        updateAnalyser();
      }, REFRESH_RATE);

      //Update data
      if (!window.monChannel.paused) {
        mon.lAnalyser.getByteTimeDomainData(wPlotter.lDataArray);
        mon.rAnalyser.getByteTimeDomainData(wPlotter.rDataArray);
        mon.lAnalyser.getByteFrequencyData(fPlotter.lDataArray);
        mon.rAnalyser.getByteFrequencyData(fPlotter.rDataArray);
        rPlotter.lDataArray = wPlotter.lDataArray;
        rPlotter.rDataArray = wPlotter.rDataArray;
      }

      //Render data
      wPlotter.renderWaveform();
      fPlotter.renderFrequence();
      rPlotter.renderResponse(RESPONSE_COLOR);
    }
  }
  
  updateAnalyser();
}

// Button [Start]
function start() {
  let btn = document.querySelector("#btnStart");
  if (btn.innerText == "Start") {
    startMonitor();
    btn.innerText = "Stop";
    document.querySelector("#btnPause").disabled = false;
  } else {
    window.monChannel.close();
    btn.innerText = "Start";
    document.querySelector("#btnPause").innerText = "Pause";
    document.querySelector("#btnPause").disabled = true;
  }
}

// Button [Pause]
function pause() {
  let btn = document.querySelector("#btnPause");
  if (btn.innerText == "Pause") {
    window.monChannel.paused = true;
    btn.innerText = "Resume";
  } else {
    window.monChannel.paused = false;
    btn.innerText = "Pause";
  }
}

// Button [Offset]
function offset() {
  if (window.wPlotter) {
    let offsetValue = document.querySelector("#offset").value;
    window.wPlotter.setOffset(offsetValue);
    window.fPlotter.setOffset(offsetValue);
    window.rPlotter.setOffset(offsetValue);  
  }
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

// Button [Start] (Signal generator)
function oscStart() {
  let btn = document.querySelector("#btnOSCStart");
  if (btn.innerText == "Start") {
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
    window.signalSource = new SignalChannel(signalType, freq, gain);
    window.signalSource.start();
    btn.innerText = "Stop";
  } else {
    //Stop Signal Generator
    window.signalSource.stop();
    btn.innerText = "Start";
  }
}

// Button [Set] (Frequency)
function setFreq() {
  let freq = parseInt(document.querySelector("#sigFreq").value);
  window.signalSource.changeFrequency(freq);
}

function changeAmp() {
  let gain = parseInt(document.querySelector("#sigAmp").value) / 100;
  window.signalSource.changeAmplitude(gain);
}

function changeType(signalType) {
  window.signalSource.changeSignalType(signalType);
}

// Initialize Application
async function initApp() {
  //Update Input Devices List
  let audioInputs = await MonitorChannel.getAudioInputs();
  let inputDropdown = document.querySelector("#inputs");
  for (let i = 0; i < audioInputs.length; i++) {
    var inputItem = document.createElement("option");
    inputItem.value = audioInputs[i].deviceId;
    inputItem.text = audioInputs[i].label;
    inputDropdown.options.add(inputItem);
  }

  //Render plotting canvas
  let wPlotter = new Plotter(document.getElementById("waveform"), 0, LEFT_CHANNEL_COLOR, RIGHT_CHANNEL_COLOR);
  let fPlotter = new Plotter(document.getElementById("frequency"), 0, LEFT_CHANNEL_COLOR, RIGHT_CHANNEL_COLOR);
  let rPlotter = new Plotter(document.getElementById("response"), 0, LEFT_CHANNEL_COLOR, RIGHT_CHANNEL_COLOR);
  wPlotter.renderWaveform();
  fPlotter.renderFrequence();
  rPlotter.renderResponse(RESPONSE_COLOR);
}