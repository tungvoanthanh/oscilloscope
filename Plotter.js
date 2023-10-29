class Plotter {
  canvas = null;
  lDataArray = null;
  rDataArray = null;
  lColor = null;
  rColor = null;
  offset = 0;

  // @Public: Constructor
  constructor(canvas, dataSize, lColor, rColor) {
    this.canvas = canvas;
    this.lDataArray = new Uint8Array(dataSize);
    this.rDataArray = new Uint8Array(dataSize);
    this.lColor = lColor;
    this.rColor = rColor;
  };

  //Set offset value
  setOffset (offsetValue) {
    let offsetNum = parseInt(offsetValue);
    let dataSize = this.lDataArray.length;
    if ((offsetNum < dataSize) && ( offsetNum + dataSize > 0)) {
      this.offset = offsetNum;
    }
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
      this.drawWaveform(this.lDataArray, this.lColor);
      this.drawWaveform(this.rDataArray, this.rColor);    
    } else {
      let shiftedData = this._getShiftedData();
      this.drawWaveform(shiftedData.left, this.lColor);
      this.drawWaveform(shiftedData.right, this.rColor);    
    }
  }

  // @Public: Render data as spectrum
  renderFrequence() {
    this.clearCanvas();
    this.drawFrequencyAxis();
    this.drawFrequency(this.lDataArray, this.lColor);
    this.drawFrequency(this.rDataArray, this.rColor);
  }

  // @Public: Render data as Response
  renderResponse(color) {
    this.clearCanvas();
    this.drawResponseAxis();
    if (this.offset == 0) {
      this.drawResponse(this.lDataArray, this.rDataArray, color);
    } else {
      let shiftedData = this._getShiftedData();
      this.drawResponse(shiftedData.left, shiftedData.right, color);
    }
  }

  // @Private: Clear canvas for new drawing
  clearCanvas() {
    const canvasCtx = this.canvas.getContext("2d");
    canvasCtx.fillStyle = "rgb(16, 201, 216)";
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
      canvasCtx.strokeStyle = "rgb(225, 225, 225)";

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
      canvasCtx.strokeStyle = "rgb(225, 225, 225)";

      canvasCtx.beginPath();
      canvasCtx.moveTo(x, 0);
      canvasCtx.lineTo(x, this.canvas.height);
      canvasCtx.stroke();

      x += STEP;
    }

    // Center X-Axis
    canvasCtx.strokeStyle = "rgb(100, 100, 100)";
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
      canvasCtx.strokeStyle = "rgb(225, 225, 225)";

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
      canvasCtx.strokeStyle = "rgb(225, 225, 225)";

      canvasCtx.beginPath();
      canvasCtx.moveTo(x, 0);
      canvasCtx.lineTo(x, this.canvas.height);
      canvasCtx.stroke();

      x += STEP_X;
    }
  }

  //@Private: Draw Response Axis
  drawResponseAxis() {
    const canvasCtx = this.canvas.getContext("2d");
    canvasCtx.lineWidth = 1;

    // X-axis = Left Channel
    let yCenter = this.canvas.height / 2;
    const STEP_Y = 15;
    let y = STEP_Y;
    while (y < yCenter) {
      canvasCtx.strokeStyle = "rgb(225, 225, 225)";

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
      canvasCtx.strokeStyle = "rgb(225, 225, 225)";

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
    canvasCtx.strokeStyle = this.lColor;
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, yCenter);
    canvasCtx.lineTo(this.canvas.width, yCenter);
    canvasCtx.stroke();

    canvasCtx.strokeStyle = this.rColor;
    canvasCtx.beginPath();
    canvasCtx.moveTo(xCenter, 0);
    canvasCtx.lineTo(xCenter, this.canvas.height);
    canvasCtx.stroke();

  }

  // @Private: Draw waveform
  drawWaveform(dataArray, color) {
    const bufferLength = dataArray.length;
    const sliceWidth = (this.canvas.width * 1.0) / bufferLength;

    const canvasCtx = this.canvas.getContext("2d");
    canvasCtx.lineWidth = 1;
    canvasCtx.strokeStyle = color;
    canvasCtx.beginPath();

    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * this.canvas.height) / 2;
      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    canvasCtx.lineTo(this.canvas.width, this.canvas.height / 2);
    canvasCtx.stroke();
  }

  // @Private: Draw frequency response
  drawFrequency(dataArray, color) {
    const bufferLength = (dataArray.length * 2) / 3; // Adjusted to 2/3 original spectrum 
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
  drawResponse(lDataArray, rDataArray, color) {
    const bufferLength = lDataArray.length;
    const SCALE_X = this.canvas.width / 255;
    const SCALE_Y = this.canvas.height / 255;

    const canvasCtx = this.canvas.getContext("2d");
    canvasCtx.fillStyle = color;
    for (let i = 0; i < bufferLength; i++) {
      let x = lDataArray[i] * SCALE_X;
      let y = this.canvas.height - (rDataArray[i] * SCALE_Y);
      canvasCtx.fillRect(x, y, 2, 2);
    }
  }
}
