class Dataset {
  constructor(plot, datasetTable, main, canvas, labels) {
    this.plot = plot;
    this.datasetTable = datasetTable;
    this.main = main;
    this.canvas = canvas;
    this.labels = labels;
    this.addDatasetButton = document.getElementById('add-dataset-button');
    this.fileInput = document.getElementById('file-input');
    this.addDatasetButton.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', () => this.loadLocalDataset());
  }

  getTrainingData() {
    return this.trainingData;
  }

  updateTrainingData(trainingData, k, updateLayout) {
    this.trainingData = trainingData;
    const labels = [];
    trainingData.forEach((d) => (labels.includes(d.label) ? {} : labels.push(d.label)));
    this.labels.setLabels(labels);
    this.plot.updateTrainingDataToPlot(trainingData);
    this.datasetTable.updateTable(trainingData);
    if (updateLayout) {
      this.plot.updateLayout(trainingData);
      this.main.updateKNN(trainingData, { x: 0, y: 0 }, k);
    }
    this.canvas.updateCanvas(trainingData, k);
    this.main.calculatePrecision(trainingData);
  }

  loadLocalDataset() {
    const reader = new FileReader();
    reader.readAsBinaryString(this.fileInput.files[0]);
    reader.onload = () => {
      this.processDatasetFile(reader.result);
    };
  }

  async loadDefaultDataset(dataset) {
    this.updateTrainingData(
      dataset.map((d) => ({ x: parseFloat(d.x1), y: parseFloat(d.x2), label: d.Clase })),
      this.main.k.value,
      true
    );
  }

  async processDatasetFile(data) {
    const separator = data.indexOf(';') !== -1 ? ';' : ',';
    const dataset = await csv(data, { separator });
    if (
      Object.keys(dataset[0])[0] === 'x1' &&
      Object.keys(dataset[0])[1] === 'x2' &&
      Object.keys(dataset[0])[2] === 'Clase'
    ) {
      this.updateTrainingData(
        dataset.map((d) => ({ x: parseFloat(d.x1), y: parseFloat(d.x2), label: d.Clase })),
        this.main.k.value,
        true
      );
    } else {
      this.updateTrainingData(
        dataset.map((d) => ({
          x: parseFloat(Object.values(d)[0]),
          y: parseFloat(Object.values(d)[1]),
          label: Object.values(d)[2],
        })),
        this.main.k.value,
        true
      );
    }
  }
}
