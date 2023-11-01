const DCOLOR_LEFT_CHANNEL = "rgb(255, 0, 0)";
const DCOLOR_RIGHT_CHANNEL = "rgb(0, 0, 255)";
const DCOLOR_RESPONSE = "rgb(0, 255, 0)";
const DCOLOR_BACKGROUND = "rgb(16, 201, 216)";
const DCOLOR_AXIS_DIV = "rgb(225, 225, 225)";
const DCOLOR_AXIS_MAIN = "rgb(100, 100, 100)";

class Display {
  canvas = null;
  lDataArray = [];
  rDataArray = [];
  offset = 0;
  lZoom = 1;
  rZoom = 1;

  // @Public: Constructor
  constructor(canvas) {
    this.canvas = canvas;
  };

  //Init data arrays
  initDataArrays(dataSize) {
    this.lDataArray = new Uint8Array(dataSize);
    this.rDataArray = new Uint8Array(dataSize);
  }

  //Set offset value
  setOffset (value) {
    let offsetNum = parseInt(value);
    let dataSize = this.lDataArray.length;
    if ((offsetNum < dataSize) && ( offsetNum + dataSize > 0)) {
      this.offset = offsetNum;
    }
  }

  // Zoom L channel signal
  zoomL(value) {
    this.lZoom = value;
  }

  // Zoom R channel signal
  zoomR(value) {
    this.rZoom = value;
  }

  // Shift data by offset
  _getShiftedData() {
    let plotSize = (this.offset < 0) ? (this.lDataArray.length + this.offset) : (this.lDataArray.length - this.offset);
    let lArray = new Uint8Array(plotSize);
    let rArray = new Uint8Array(plotSize);

    if (this.offset < 0) {
      // Shift right-channel to the left
      for (let i = 0; i < plotSize; i++) {
        lArray[i] = this.lDataArray[i];
        rArray[i] = this.rDataArray[i - this.offset];
      }
    } else if (this.offset > 0) {
      // Shift left-channel to the left
      for (let i = 0; i < plotSize; i++) {
        lArray[i] = this.lDataArray[i + this.offset];
        rArray[i] = this.rDataArray[i];
      }
    }

    return { left: lArray, right: rArray };
  }

  // @Public: Render data as waveform
  renderWaveform() {
    this.clearCanvas();
    this.drawWaveformAxis();
    if (this.offset == 0) {
      this.drawWaveform(this.lDataArray, DCOLOR_LEFT_CHANNEL, this.lZoom);
      this.drawWaveform(this.rDataArray, DCOLOR_RIGHT_CHANNEL, this.rZoom);    
    } else {
      let shiftedData = this._getShiftedData();
      this.drawWaveform(shiftedData.left, DCOLOR_LEFT_CHANNEL, this.lZoom);
      this.drawWaveform(shiftedData.right, DCOLOR_RIGHT_CHANNEL, this.rZoom);    
    }
  }

  // @Public: Render data as spectrum
  renderFrequency() {
    this.clearCanvas();
    this.drawFrequencyAxis();
    this.drawFrequency(this.lDataArray, DCOLOR_LEFT_CHANNEL);
    this.drawFrequency(this.rDataArray, DCOLOR_RIGHT_CHANNEL);
  }

  // @Public: Render data as Response
  renderResponse() {
    this.clearCanvas();
    this.drawPhaseAxis();
    if (this.offset == 0) {
      this.drawResponse(this.lDataArray, this.rDataArray, DCOLOR_RESPONSE, this.lZoom, this.rZoom);
    } else {
      let shiftedData = this._getShiftedData();
      this.drawResponse(shiftedData.left, shiftedData.right, DCOLOR_RESPONSE, this.lZoom, this.rZoom);
    }
  }

  // @Private: Clear canvas for new drawing
  clearCanvas() {
    const canvasCtx = this.canvas.getContext("2d");
    canvasCtx.fillStyle = DCOLOR_BACKGROUND;
    canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // @Private: Draw axis for waveform
  drawWaveformAxis() {
    const canvasCtx = this.canvas.getContext("2d");
    const yCenter = this.canvas.height / 2;
    canvasCtx.lineWidth = 1;

    // X-Axis
    const STEP = 15;
    let yOffset = STEP;
    while (yOffset < yCenter) {
      canvasCtx.strokeStyle = DCOLOR_AXIS_DIV;

      canvasCtx.beginPath();
      canvasCtx.moveTo(0, yCenter - yOffset);
      canvasCtx.lineTo(this.canvas.width, yCenter - yOffset);
      canvasCtx.stroke();

      canvasCtx.beginPath();
      canvasCtx.moveTo(0, yCenter + yOffset);
      canvasCtx.lineTo(this.canvas.width, yCenter + yOffset);
      canvasCtx.stroke();

      yOffset += STEP;
    }

    // Y-Axis
    let x = 0;
    while (x < this.canvas.width) {
      canvasCtx.strokeStyle = DCOLOR_AXIS_DIV;

      canvasCtx.beginPath();
      canvasCtx.moveTo(x, 0);
      canvasCtx.lineTo(x, this.canvas.height);
      canvasCtx.stroke();

      x += STEP;
    }

    // Center X-Axis
    canvasCtx.strokeStyle = DCOLOR_AXIS_MAIN;
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, yCenter);
    canvasCtx.lineTo(this.canvas.width, yCenter);
    canvasCtx.stroke();

  }

  // @Private: Draw Frequency Axis
  drawFrequencyAxis() {
    const canvasCtx = this.canvas.getContext("2d");
    canvasCtx.lineWidth = 1;

    // Horizontal lines
    const STEP_Y = 15;
    let y = this.canvas.height;
    while (y > 0) {
      canvasCtx.strokeStyle = DCOLOR_AXIS_DIV;

      canvasCtx.beginPath();
      canvasCtx.moveTo(0, y);
      canvasCtx.lineTo(this.canvas.width, y);
      canvasCtx.stroke();

      y -= STEP_Y;
    }

    // Vertical lines
    const STEP_X = this.canvas.width / 10;
    let x = 0;
    while (x < this.canvas.width) {
      canvasCtx.strokeStyle = DCOLOR_AXIS_DIV;

      canvasCtx.beginPath();
      canvasCtx.moveTo(x, 0);
      canvasCtx.lineTo(x, this.canvas.height);
      canvasCtx.stroke();

      x += STEP_X;
    }
  }

  //@Private: Draw Response Axis
  drawPhaseAxis() {
    const canvasCtx = this.canvas.getContext("2d");
    canvasCtx.lineWidth = 1;

    // X-axis = Left Channel
    let yCenter = this.canvas.height / 2;
    const STEP_Y = 15;
    let y = STEP_Y;
    while (y < yCenter) {
      canvasCtx.strokeStyle = DCOLOR_AXIS_DIV;

      canvasCtx.beginPath();
      canvasCtx.moveTo(0, yCenter - y);
      canvasCtx.lineTo(this.canvas.width, yCenter - y);
      canvasCtx.stroke();

      canvasCtx.beginPath();
      canvasCtx.moveTo(0, yCenter + y);
      canvasCtx.lineTo(this.canvas.width, yCenter + y);
      canvasCtx.stroke();

      y += STEP_Y;
    }

    // Y-axis = Right Channel
    let xCenter = this.canvas.width / 2;
    const STEP_X = 15;
    let x = STEP_X;
    while (x < xCenter) {
      canvasCtx.strokeStyle = DCOLOR_AXIS_DIV;

      canvasCtx.beginPath();
      canvasCtx.moveTo(xCenter - x, 0);
      canvasCtx.lineTo(xCenter - x, this.canvas.height);
      canvasCtx.stroke();

      canvasCtx.beginPath();
      canvasCtx.moveTo(xCenter + x, 0);
      canvasCtx.lineTo(xCenter + x, this.canvas.height);
      canvasCtx.stroke();

      x += STEP_X;
    }

    // Center X-Y Axis
    canvasCtx.strokeStyle = DCOLOR_LEFT_CHANNEL;
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, yCenter);
    canvasCtx.lineTo(this.canvas.width, yCenter);
    canvasCtx.stroke();

    canvasCtx.strokeStyle = DCOLOR_RIGHT_CHANNEL;
    canvasCtx.beginPath();
    canvasCtx.moveTo(xCenter, 0);
    canvasCtx.lineTo(xCenter, this.canvas.height);
    canvasCtx.stroke();

  }

  // @Private: Draw waveform
  drawWaveform(dataArray, color, zoom) {
    const bufferLength = dataArray.length;
    const sliceWidth = (this.canvas.width * 1.0) / bufferLength;
    const SCALE = this.canvas.height / 256;
    const yCenter = this.canvas.height / 2;

    const canvasCtx = this.canvas.getContext("2d");
    canvasCtx.lineWidth = 1;
    canvasCtx.strokeStyle = color;
    canvasCtx.beginPath();

    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const y = dataArray[i] * SCALE; //Scale to canvas size
      const yZ = ((y - yCenter) * zoom) + yCenter; //Scale by zoom factor
      if (i === 0) {
        canvasCtx.moveTo(x, yZ);
      } else {
        canvasCtx.lineTo(x, yZ);
      }
      x += sliceWidth;
    }
    canvasCtx.lineTo(this.canvas.width, this.canvas.height / 2);
    canvasCtx.stroke();
  }

  // @Private: Draw frequency response
  drawFrequency(dataArray, color) {
    const bufferLength = dataArray.length;
    const sliceWidth = (this.canvas.width * 1.0) / bufferLength;

    const canvasCtx = this.canvas.getContext("2d");
    canvasCtx.lineWidth = 1;
    canvasCtx.strokeStyle = color;
    canvasCtx.beginPath();

    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = (255 - dataArray[i]) / 255;
      const y = v * this.canvas.height;
      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    canvasCtx.lineTo(this.canvas.width, this.canvas.height);
    canvasCtx.stroke();
  }

  // @Private: Draw Response
  // Left Channel => X
  // Right Channel => Y
  drawResponse(lDataArray, rDataArray, color, zoomL, zoomR) {
    const bufferLength = lDataArray.length;
    const SCALE_X = this.canvas.width / 255;
    const SCALE_Y = this.canvas.height / 255;
    const xCenter = this.canvas.width / 2;
    const yCenter = this.canvas.height / 2;

    const canvasCtx = this.canvas.getContext("2d");
    canvasCtx.fillStyle = color;
    for (let i = 0; i < bufferLength; i++) {
      //Scale to canvas size
      const x = lDataArray[i] * SCALE_X;
      const y = rDataArray[i] * SCALE_Y;
      //Scale by zoom factor
      const xZ = ((x - xCenter) * zoomL) + xCenter;
      const yZ = ((y - yCenter) * zoomR) + yCenter;
      //Flip Y
      canvasCtx.fillRect(xZ, this.canvas.height - yZ, 2, 2);
    }
  }
}
