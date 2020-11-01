const fps = 60;

class Events {
  constructor(main, plot, dataset, k, canvas) {
    this.main = main;
    this.plot = plot;
    this.k = k;
    this.dataset = dataset;
    this.canvas = canvas;
    this.rect = document.querySelector('.nsewdrag.drag');
    this.rect.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.rect.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.plot.chart.on('plotly_relayout', () => this.onZoom());
    this.nextUpdate = 0;
    this.timeout = null;
    document
      .getElementById('select-classification-method')
      .addEventListener('change', () => this.main.updateClassificationMethod());
    document
      .getElementById('show-grid')
      .addEventListener('change', () => this.canvas.updateCanvas(...this.canvas.lastData));
    document.getElementById('show-axis').addEventListener('change', () => this.plot.toggleAxisGrid());
  }

  onMouseDown(evt) {
    if (this.plot.mode === 'add') {
      const newInstance = this.getMouseCoords(evt);
      const trainingData = this.dataset.getTrainingData();
      const k = this.k.value;
      const newInstanceClassified = this.main.knn(
        trainingData,
        newInstance,
        k,
        this.main.getClassificationMethod()
      ).d;
      trainingData.push(newInstanceClassified);
      this.dataset.updateTrainingData(trainingData, k, true);
    }
  }

  onMouseMove(evt) {
    // check for too many updates, may be too heavy to execute on all move events
    const now = Date.now();
    if (this.nextUpdate > now) {
      if (this.timeout) clearTimeout(this.timeout);
      // Timeout helps if mouse stops moving and position is not centered
      this.timeout = setTimeout(() => {
        const newInstance = this.getMouseCoords(evt);
        this.main.updateKNN(this.dataset.getTrainingData(), newInstance, this.k.value);
        document.getElementById('mouse-position').innerHTML = `X: ${newInstance.x.toFixed(
          4
        )} | Y: ${newInstance.y.toFixed(4)}`;
      }, this.nextUpdate - now);
      return;
    }
    this.nextUpdate = now + 1000 / fps;
  }

  // Convert from mouse position to coordinates position
  getMouseCoords(evt) {
    const xaxis = this.plot.chart._fullLayout.xaxis;
    const yaxis = this.plot.chart._fullLayout.yaxis;
    const l = this.plot.chart.getBoundingClientRect().x + this.plot.chart._fullLayout.margin.l;
    const t = this.plot.chart.getBoundingClientRect().y + this.plot.chart._fullLayout.margin.t;
    const x = xaxis.p2c(evt.x - l);
    const y = yaxis.p2c(evt.y - t);
    return { x, y };
  }

  onZoom() {
    this.canvas.updateCanvas(this.dataset.getTrainingData(), this.k.value);
  }
}
