//Singal Channel
class SignalChannel {
    audioCtx = null;
    oscNode = null;
    gainNode = null;

    // Constructor
    constructor(signalType, frequency, amplitude) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();     
        this.oscNode = this.audioCtx.createOscillator();
        this.oscNode.type = signalType;
        this.oscNode.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.setValueAtTime(amplitude, this.audioCtx.currentTime);
        this.oscNode.connect(this.gainNode);
        this.gainNode.connect(this.audioCtx.destination);
    }

    // Change Signal Type
    changeSignalType(signalType) {
        this.oscNode.type = signalType;
    }

    // Change Frequency
    changeFrequency(frequency) {
        this.oscNode.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
    }

    // Change Amplitude
    changeAmplitude(amplitude) {
        this.gainNode.gain.setValueAtTime(amplitude, this.audioCtx.currentTime);
    }

    // Start Signal
    start() {
        this.oscNode.start();
    }

    // Stop Signal
    stop() {
        this.oscNode.stop();
    }

    /*****************************
     * Method getAudioOutputs()  *
     *****************************/
    static async getAudioOutputs() {
        let audioOutputs = [];
        if (!navigator.mediaDevices?.enumerateDevices) {
            console.log("enumerateDevices() not supported.");
        } else {
            await navigator.mediaDevices.enumerateDevices()
                .then((devices) => {
                    devices.forEach((device) => {
                        if (device.kind == 'audiooutput') {
                            audioOutputs.push({
                                kind: device.kind,
                                deviceId: device.deviceId,
                                label: device.label,
                            });
                        }
                    });
                })
                .catch((err) => { console.log(`${err.name}: ${err.message}`); });
        }
        return Promise.resolve(audioOutputs);
    }
}
