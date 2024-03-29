class Table {
  constructor(main, bodyId, columns = [], parsers = {}, labels, editable) {
    this.main = main;
    this.tableBody = document.getElementById(bodyId);
    this.columns = columns;
    this.parsers = parsers;
    this.labels = labels;
    this.editable = editable;
  }

  removeAllChildNodes(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }

  addTableData(tr, value, rowIndex, columnIndex) {
    const td = document.createElement('td');
    if (this.editable) {
      td.setAttribute('contentEditable', true);
      td.classList.add('td-editable');
      td.addEventListener('focusout', (evt) => this.updateCell(rowIndex, columnIndex, evt.target.innerText));
      td.addEventListener('keydown', (evt) => {
        if (evt.key === 'Enter') {
          evt.preventDefault();
          evt.target.blur();
          this.updateCell(rowIndex, columnIndex, evt.target.innerText);
        }
      });
    }
    td.innerText = value;
    tr.appendChild(td);
  }

  updateTable(rows, loading) {
    this.removeAllChildNodes(this.tableBody);
    if (loading) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.setAttribute("colspan", 3);
      td.innerHTML = `<span class="is-flex is-flex-direction-row is-justify-content-center is-align-items-center">Calculando<button class="button is-loading is-white"></button></span>`;
      tr.appendChild(td);
      this.tableBody.appendChild(tr);
    }
    rows.forEach((row, rowIndex) => {
      const tr = document.createElement('tr');
      if (this.labels && row.label) {
        tr.style.backgroundColor = this.labels.getColor(row.label, "40");
      }
      this.addTableData(tr, rowIndex + 1);
      this.columns.forEach((column, columnIndex) => {
        this.addTableData(
          tr,
          this.parsers[column] ? this.parsers[column](row[column]) : row[column],
          rowIndex,
          columnIndex
        );
      });
      if (this.editable && rows.length > 1) this.addRemoveRowButton(tr, rowIndex);
      this.tableBody.appendChild(tr);
    });
  }

  updateCell(rowIndex, columnIndex, value) {
    const trainingData = this.main.dataset.getTrainingData();
    const column = this.columns[columnIndex];
    if (column === 'label') {
      trainingData[rowIndex][column] = value;
    } else {
      //checks if x or y is a valid number, otherwise doesn't edit the cell value
      if (parseFloat(value) || parseFloat(value) === 0) trainingData[rowIndex][column] = parseFloat(value);
    }

    this.main.dataset.updateTrainingData(trainingData, this.main.k.value, true);
  }

  addRemoveRowButton(tr, rowIndex) {
    const td = document.createElement('td');
    td.classList.add('td-remove-row');
    const button = document.createElement('button');
    button.classList.add('button', 'is-danger', 'is-small');
    button.innerText = 'X';
    button.addEventListener('click', () => {
      const trainingData = this.main.dataset.getTrainingData();
      trainingData.splice(rowIndex, 1);
      this.main.dataset.updateTrainingData(trainingData, this.main.k.value, true);
      tr.remove();
    });
    td.appendChild(button);
    tr.appendChild(td);
  }
}
