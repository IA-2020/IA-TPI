const sliderId = 'k-slider';
const inputId = 'k-input';

class K {
  constructor(main, plot, canvas, dataset) {
    this.slider = new Input("K", sliderId, null, v => this.update(v));
    this.input = new Input("K", inputId, null, v => this.update(v));
    this.main = main;
    this.plot = plot;
    this.canvas = canvas;
    this.dataset = dataset;
  }

  update(k) {
    this.input.value = k;
    this.slider.value = k;
    this.main.updateKNN(this.dataset.getTrainingData(), { x: 0, y: 0 }, k);
    this.canvas.updateCanvas(this.dataset.getTrainingData(), k);
  }

  get value() {
    return this.input.value;
  }
}
