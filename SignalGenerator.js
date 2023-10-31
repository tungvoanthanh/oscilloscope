const DEFAULT_SIGNAL_TYPE = "sine";
const DEFAULT_SIGNAL_FREQUENCY = 440;
const DEFAULT_SIGNAL_GAIN = 0.8;

class SignalGenerator {
    active = false;
    audioCtx = null;
    signalParams = {
        type: "sine",
        frequency: 220,
        amplitude: 1
    };
    oscNode = null;
    gainNode = null;

    // Constructor
    constructor(audioCtx, signalType, freq, gain) {
        this.audioCtx = audioCtx;
        this.signalParams = {
            type: signalType,
            frequency: freq,
            amplitude: gain
        };

        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.setValueAtTime(this.signalParams.amplitude, this.audioCtx.currentTime);
        this.gainNode.connect(this.audioCtx.destination);
    }

    // Connect to an Analyser Node
    connectAnalyser(analyser) {
        this.gainNode.connect(analyser);
        analyser.connect(this.audioCtx.destination);
    }

    // Start Signal
    start() {
        this.oscNode = this.audioCtx.createOscillator();
        this.oscNode.type = this.signalParams.type;
        this.oscNode.frequency.setValueAtTime(this.signalParams.frequency, this.audioCtx.currentTime);
        this.oscNode.connect(this.gainNode);
        this.oscNode.start();
        this.active = true;
    }

    // Stop Signal
    stop() {
        if (this.active) {
            this.oscNode.stop();
            this.active = false;    
        }
    }

    // Change Signal Type
    changeSignalType(signalType) {
        this.signalParams.type = signalType;
        if (this.active) {
            this.oscNode.type = signalType;
        }
    }

    // Change Frequency
    changeFrequency(frequency) {
        this.signalParams.frequency = frequency;
        if (this.active) {
            this.oscNode.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
        }
    }

    // Change Amplitude
    changeAmplitude(amplitude) {
        this.signalParams.amplitude = amplitude;
        if (this.active) {
            this.gainNode.gain.setValueAtTime(amplitude, this.audioCtx.currentTime);
        }
    }
}
