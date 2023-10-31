const FFT_SIZE = 2048;

class Plotter {
    audioCtx = null;
    lAnalyser = null;
    inputStream = null;
    rAnalyser = null;
    active = false;
    paused = false;

    dsplWaveform = null;
    dsplPhase = null;
    dsplFrequency = null;

    constructor(audioCtx, cvsWaveform, cvsPhase, cvsFrequency) {
        this.audioCtx = audioCtx;

        //Create Analysers
        this.lAnalyser = this.audioCtx.createAnalyser();
        this.lAnalyser.fftSize = FFT_SIZE;

        this.rAnalyser = this.audioCtx.createAnalyser();
        this.rAnalyser.fftSize = FFT_SIZE;

        //Init Displays
        this.dsplWaveform = new Display(cvsWaveform);
        this.dsplWaveform.initDataArrays(this.lAnalyser.frequencyBinCount);
        this.dsplWaveform.renderWaveform();

        this.dsplPhase = new Display(cvsPhase);
        this.dsplPhase.initDataArrays(this.lAnalyser.frequencyBinCount);
        this.dsplPhase.renderResponse();

        this.dsplFrequency = new Display(cvsFrequency);
        this.dsplFrequency.renderFrequence();
        this.dsplFrequency.initDataArrays(this.lAnalyser.frequencyBinCount);
    }

    // Update analysers and displays
    updateDisplays() {
        if (!this.paused) {
            this.lAnalyser.getByteTimeDomainData(this.dsplWaveform.lDataArray);
            this.rAnalyser.getByteTimeDomainData(this.dsplWaveform.rDataArray);
            this.dsplPhase.lDataArray = this.dsplWaveform.lDataArray;
            this.dsplPhase.rDataArray = this.dsplWaveform.rDataArray;
            this.lAnalyser.getByteFrequencyData(this.dsplFrequency.lDataArray);
            this.rAnalyser.getByteFrequencyData(this.dsplFrequency.rDataArray);
        }

        //Render data
        this.dsplWaveform.renderWaveform();
        this.dsplPhase.renderResponse();
        this.dsplFrequency.renderFrequence();
    }

    // Start Plotter in Mono mode
    async start(device_id, signal) {
        //Connect signal generator to analyser if provided
        if (signal) {
            signal.connectAnalyser(this.lAnalyser);
        }
        //Get Input Device
        let constraints = {
            audio: {
                autoGainControl: false,
                noiseSuppression: false,
                echoCancellation: false,
                deviceId: device_id,
                channelCount: 2,
                sampleRate: 48000,
                sampleSize: 16
            },
            video: false
        }
        try {
            await navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                this.inputStream = stream;
            });
        } catch (err) {
            alert("Cannot initiate the selected device");
        }
        const input = this.audioCtx.createMediaStreamSource(this.inputStream);
        input.connect(this.rAnalyser);
        this.active = true;
    }

    // Start Plotter in Stereo mode
    async startStereo(device_id) {
        //Get Input Device
        let constraints = {
            audio: {
                autoGainControl: false,
                noiseSuppression: false,
                echoCancellation: false,
                deviceId: device_id,
                channelCount: 2,
                sampleRate: 48000,
                sampleSize: 16
            },
            video: false
        }
        try {
            await navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                this.inputStream = stream;
            });
        } catch (err) {
            alert("Cannot initiate the selected device");
        }
        const input = this.audioCtx.createMediaStreamSource(this.inputStream);
        const splitter = audioCtx.createChannelSplitter(2);
        input.connect(splitter);
        splitter.connect(this.lAnalyser, 0, 0);
        splitter.connect(this.rAnalyser, 1, 0);

        this.active = true;
    }

    // Pause Plotter
    pause() {
        this.paused = true;
    }

    // Resume Plotter
    resume() {
        this.paused = false;
    }

    // Stop Plotter
    stop() {
        this.active = false;
        this.paused = false;
        this.inputStream?.getTracks().forEach((track) => {
            track.stop();
        });
    }

    // Set Display Offset
    setOffset(value) {
        this.dsplWaveform?.setOffset(value);
        this.dsplPhase?.setOffset(value);
    }

    // Zoom L channel signal
    zoomL(value) {
        this.dsplWaveform?.zoomL(value);
        this.dsplPhase?.zoomL(value);
    }

    // Zoom R channel signal
    zoomR(value) {
        this.dsplWaveform?.zoomR(value);
        this.dsplPhase?.zoomR(value);
    }

    /*****************************
     * Method getAudioInputs()  *
     *****************************/
    static async getAudioInputs() {
        let audioInputs = [];
        if (!navigator.mediaDevices?.enumerateDevices) {
            console.log("enumerateDevices() not supported.");
        } else {
            await navigator.mediaDevices.enumerateDevices()
                .then((devices) => {
                    devices.forEach((device) => {
                        if (device.kind == 'audioinput') {
                            audioInputs.push({
                                kind: device.kind,
                                deviceId: device.deviceId,
                                label: device.label
                            });

                            //Debug
                            //console.log(device.label);
                            //console.log(device.getCapabilities());
                        }
                    });
                })
                .catch((err) => { console.log(`${err.name}: ${err.message}`); });
        }
        return Promise.resolve(audioInputs);
    }

    /*****************************
     * Method getStereoAudioInputs()  *
     *****************************/
    static async getStereoAudioInputs() {
        let audioInputs = [];
        if (!navigator.mediaDevices?.enumerateDevices) {
            console.log("enumerateDevices() not supported.");
        } else {
            await navigator.mediaDevices.enumerateDevices()
                .then((devices) => {
                    devices.forEach((device) => {
                        if (device.kind == 'audioinput' && device.getCapabilities().channelCount.max >= 2) {
                            audioInputs.push({
                                kind: device.kind,
                                deviceId: device.deviceId,
                                label: device.label
                            });

                            //Debug
                            //console.log(device.label);
                            //console.log(device.getCapabilities());
                        }
                    });
                })
                .catch((err) => { console.log(`${err.name}: ${err.message}`); });
        }
        return Promise.resolve(audioInputs);
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
