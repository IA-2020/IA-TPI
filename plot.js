const chartId = 'chart';
const plotlyOptions = {
  doubleClick: false,
  showAxisDragHandles: false,
  scrollZoom: false,
  locale: 'es',
  displaylogo: false,
  responsive: true,
  displayModeBar: true,
  modeBarButtons: [
    [
      {
        name: 'Agregar instancias',
        icon: Plotly.Icons.pencil,
        click: () => main.plot.setMode('add'),
        val: 'add'
      },
      {
        name: 'Comparar KNN',
        // NOT SUPPORTED :(
        // active: true,
        icon: {
          width: 576,
          height: 512,
          path: "M 288 144 a 110.94 110.94 0 0 0 -31.24 5 a 55.4 55.4 0 0 1 7.24 27 a 56 56 0 0 1 -56 56 a 55.4 55.4 0 0 1 -27 -7.24 A 111.71 111.71 0 1 0 288 144 Z m 284.52 97.4 C 518.29 135.59 410.93 64 288 64 S 57.68 135.64 3.48 241.41 a 32.35 32.35 0 0 0 0 29.19 C 57.71 376.41 165.07 448 288 448 s 230.32 -71.64 284.52 -177.41 a 32.35 32.35 0 0 0 0 -29.19 Z M 288 400 c -98.65 0 -189.09 -55 -237.93 -144 C 98.91 167 189.34 112 288 112 s 189.09 55 237.93 144 C 477.1 345 386.66 400 288 400 Z"
        },
        click: () => main.plot.setMode('view'),
        val: 'view'
      },
      // 'pan2d',
      // 'zoomIn2d',
      // 'zoomOut2d',
      // 'resetScale2d',
      // 'toImage',
    ],
  ],
};

class Plot {
  constructor(labels, knnTable) {
    this.labels = labels;
    this.knnTable = knnTable;
    this.chart = document.getElementById(chartId);
    this.layout = {
      autosize: false,
      height: 800,
      width: 800,
      margin: {
        l: 40,
        r: 40,
        b: 40,
        t: 40,
        pad: 8,
      },
      xaxis: {
        nticks: 21,
        range: [-15, 15],
        showgrid: false,
        zeroline: false,
        fixedrange: true
      },
      yaxis: {
        nticks: 23,
        range: [-15, 15],
        showgrid: false,
        zeroline: false,
        fixedrange: true
      },
      legend: {
        orientation: 'h',
        x: -0.02,
        y: -0.04,
        yref: 'paper',
        font: {
          family: 'Avenir, Helvetica, Arial, sans-serif',
          size: 20,
          color: 'grey',
        },
      },
    };
    Plotly.newPlot(chart, [], this.layout, plotlyOptions);
    this.setMode('view');
  }

  updateLayout(data) {
    const xaxis = { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER };
    const yaxis = { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER };
    data.forEach((d) => {
      if (d.x < xaxis.min) xaxis.min = d.x;
      if (d.x > xaxis.max) xaxis.max = d.x;
      if (d.y < yaxis.min) yaxis.min = d.y;
      if (d.y > yaxis.max) yaxis.max = d.y;
    });
    const xDiff = (xaxis.max - xaxis.min) * 0.1;
    const yDiff = (yaxis.max - yaxis.min) * 0.1;
    xaxis.min -= xDiff;
    xaxis.max += xDiff;
    yaxis.min -= yDiff;
    yaxis.max += yDiff;
    this.layout.xaxis.range = [xaxis.min, xaxis.max];
    this.layout.yaxis.range = [yaxis.min, yaxis.max];
  }

  updatePlot(P, d, k) {
    Plotly.react(this.chart, this.formatNewInstanceToPlot(P, d, k), this.layout, plotlyOptions);
  }

  updateTrainingDataToPlot(trainingData) {
    const plotableData = this.labels.getLabels().map((label) => ({
      x: [],
      y: [],
      mode: 'markers',
      marker: {
        size: 8,
        color: this.labels.getColor(label),
      },
      name: label,
      hoverinfo: 'none',
    }));
    trainingData.forEach((element) => {
      let index = plotableData.findIndex((data) => data.name === element.label);
      if (index !== -1) {
        plotableData[index].x.push(element.x);
        plotableData[index].y.push(element.y);
      }
    });
    this.plotedTrainingData = plotableData;
  }

  formatNewInstanceToPlot(P, d, k) {
    const plotableData = JSON.parse(JSON.stringify(this.plotedTrainingData));
    const index = plotableData.findIndex((data) => data.name === d.label);
    if (index !== -1) {
      plotableData[index].x.push(d.x);
      plotableData[index].y.push(d.y);
    }
    const max = k < P.length ? k : P.length;
    for (let i = 0; i < max; i++) {
      const data = P[i];
      plotableData.push({
        x: [data.x, d.x],
        y: [data.y, d.y],
        mode: 'lines',
        line: {
          width: 2,
          color: this.labels.getColor(data.label),
        },
        showlegend: false,
        hoverinfo: 'none',
      });
    }
    return plotableData;
  }

  setMode(mode) {
    this.mode = mode;
  }

  toggleAxisGrid() {
    this.layout.xaxis.showgrid = !this.layout.xaxis.showgrid;
    this.layout.yaxis.showgrid = !this.layout.yaxis.showgrid;
    Plotly.react(this.chart, this.plotedTrainingData, this.layout, plotlyOptions);
  }
}
