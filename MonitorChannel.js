//Monitor Channel
class MonitorChannel {
    active = false;
    paused = false;
    sourceStream = null;
    lAnalyser = null;
    rAnalyser = null;

    // Close this channel
    close() {
        this.active = false;
        this.sourceStream.getTracks().forEach((track) => {
            track.stop();
        });
    }

    //Create a monitor channel for the given device
    static async createMonitorChannel(device_id) {
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
            let monChannel = new MonitorChannel();

            await navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                const audioCtx = new AudioContext();
                const input = audioCtx.createMediaStreamSource(stream);
                const splitter = audioCtx.createChannelSplitter(2);
                const lAnalyser = audioCtx.createAnalyser();
                const rAnalyser = audioCtx.createAnalyser();
                lAnalyser.fftSize = 2048;
                rAnalyser.fftSize = 2048;

                input.connect(splitter);
                splitter.connect(lAnalyser, 0, 0);
                splitter.connect(rAnalyser, 1, 0);

                // Monitor channel object
                monChannel.sourceStream = stream;
                monChannel.lAnalyser = lAnalyser;
                monChannel.rAnalyser = rAnalyser;
                monChannel.active = true;
            });

            return monChannel;
        } catch (err) {
            alert("Cannot initiate the selected device");
            return null;
        }
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
                        //if (device.kind == 'audioinput' && device.getCapabilities().channelCount.max >= 2) {
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

}
