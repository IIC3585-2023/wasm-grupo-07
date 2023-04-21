const INY_BYTES = 4; //4 bytes por cada elemento (entero de 32 bits)

//------//
// Utilidades //
//------//
function setOutputHtml(clusters, time, section) {
  // Mostrar el resultado en la página
  var outputDiv = document.getElementById('output_' + section);
  outputDiv.innerHTML = '';
  outputDiv.innerHTML += '<h3>' + section + '</h3>';
  outputDiv.innerHTML += '<h4> Time:' + time + '</h4>';
  let n_job = 1;
  for (const cluster of clusters) {
    outputDiv.innerHTML += '<p> Trabajo ' + n_job + ': ' + cluster + '</p>';
    n_job++;
  }
}

function getData() {
  // Obtener los datos de entrada del formulario
  var jobs = document
    .getElementById('jobDurations')
    .value.split(',')
    .map(function (x) {
      return parseInt(x);
    });
  var N = jobs.length;
  var M = parseInt(document.getElementById('numClusters').value);
  return [N, jobs, M];
}

//------//
// WORKERS //
//------//
let progressStartValue = 0,
  progressEndValue = 100;
workersObj = {};

const createRace = (N, jobs, M, workDistribution, exec_time, source) => {
  setUpWorkersInHtml(M, source);
  createWorkers(M, source);
  fillUpJobs(jobs, workDistribution, source, exec_time);
  startProgress(source, exec_time);
};

const setUpWorkersInHtml = (M, source) => {
  const container = document.querySelector(`.${source}`); // select the container element

  const h2 = document.createElement('h2');
  h2.textContent = source.slice(0, -3).toUpperCase();
  container.appendChild(h2);

  for (let i = -1; i < M; i++) {
    //Create h1 element

    // create the worker div element
    const workerDiv = document.createElement('div');
    workerDiv.classList.add('worker');

    // create the circular-progress div element
    const progressDiv = document.createElement('div');
    progressDiv.classList.add('circular-progress');
    progressDiv.id = `progress-${source}-worker-${i}`;

    // create the progress-value span element
    const valueSpan = document.createElement('span');
    valueSpan.classList.add('progress-value');
    valueSpan.id = `${source}-worker-${i}`;
    valueSpan.textContent = '0%';

    // append the progress-value span element to the circular-progress div element
    progressDiv.appendChild(valueSpan);

    // create the text span element
    const textSpan = document.createElement('span');
    textSpan.classList.add('text');
    if (i == -1) textSpan.textContent = 'Procesamiento';
    else textSpan.textContent = `Cluster ${i + 1}`;

    // append the circular-progress and text span elements to the worker div element
    workerDiv.appendChild(progressDiv);
    workerDiv.appendChild(textSpan);

    // append the worker div element to the container element
    container.appendChild(workerDiv);
  }
};

const createWorkers = (M, source) => {
  let workers = [];
  for (let i = -1; i < M; i++) {
    workers.push({
      id: `Worker ${i}`,
      jobs: [],
      progress: 0,
    });
  }
  const element = source;
  console.log(workers);
  workersObj[element] = workers;
};

const fillUpJobs = (jobsToDo, workDistribution, source, exec_time) => {
  workersObj[source][0].jobs.push(exec_time);
  for (let i = 0; i < jobsToDo.length; i++) {
    workersObj[source][workDistribution[i]].jobs.push(jobsToDo[i]);
  }
};

const startProgress = (source, exec_time) => {
  workersObj[source].forEach((worker, index) => {
    let workerId = index - 1;
    let speed = worker.jobs[0] * 10;
    initJob(workerId, speed, source, exec_time);
  });
};

const activateJob = (workerId, source) => {
  let circularProgressWorker = document.querySelector(
    `#progress-${source}-worker-${workerId}`
  );
  let progressWorkerValue = document.querySelector(
    `#${source}-worker-${workerId}`
  );
  let messureUnit = 's';
  if (workerId == -1) messureUnit = 'ms';
  progressWorkerValue.textContent = `${
    workersObj[source][workerId + 1].jobs[0]
  }${messureUnit}`;
  circularProgressWorker.style.background = `conic-gradient(#7d2ae8 ${
    workersObj[source][workerId + 1].progress * 3.6
  }deg, #ededed 0deg)`;

  if (workersObj[source][workerId + 1].progress == progressEndValue)
    return true;
  return false;
};

const initJob = async (workerId, speed, source, sleepTime = 0) => {
  if (workerId !== -1) {
    console.log('Estoy durmiendo');
    await sleep(sleepTime * 1000);
  }
  console.log('Desperté');
  let timer = setInterval(() => {
    const isFinished = activateJob(workerId, source);
    workersObj[source][workerId + 1].progress++;
    if (isFinished) {
      clearInterval(timer);
      if (workersObj[source][workerId + 1].jobs.length > 1) {
        workersObj[source][workerId + 1].progress = 0;
        workersObj[source][workerId + 1].jobs.shift();
        speed = workersObj[source][workerId + 1].jobs[0] * 10;
        initJob(workerId, speed, source);
      } else {
        finished(workerId, source);
      }
    }
  }, speed);
};

const finished = (workerId, source) => {
  let progressWorker = document.querySelector(`#${source}-worker-${workerId}`);
  if (workerId != -1) progressWorker.textContent = 'Finished';
};

// Wait for WASM compilation.
Module.onRuntimeInitialized = () => {
  document.getElementById('execute_btn').onclick = () => {
    //JS//
    const workers = document.querySelectorAll('.worker');
    const h2 = document.querySelectorAll('h2');
    h2.forEach((h2) => {
      h2.remove();
    });
    workers.forEach((worker) => {
      worker.remove();
    });

    [N, jobs, M] = getData();
    const tjs0 = performance.now();
    // const clusters = taskAssignment(N, jobs, M)
    const clustersJS = taskAssignment2(N, jobs, M);
    const tjs1 = performance.now();
    const exec_js_time = (tjs1 - tjs0).toFixed(4);
    console.log(clustersJS);

    createRace(N, jobs, M, clustersJS, exec_js_time, 'javascriptAlg');
    // setOutputHtml(clustersJS, tjs1 - tjs0, 'JS');

    // WASM //

    console.log('Estos son los datos de entrada:', N, jobs, M);

    const jobsPtr = Module._malloc(N * INY_BYTES);
    Module.HEAP32.set(jobs, jobsPtr / INY_BYTES);

    // const clustersPtr = Module.ccall("task_assignment", "number",
    // ["number", "number", "number"],
    // [N, jobsPtr, M]);

    const twasm0 = performance.now();
    const clustersPtr = Module.ccall(
      'task_assignment2',
      'number',
      ['number', 'number', 'number'],
      [N, jobsPtr, M]
    );
    const twasm1 = performance.now();

    const clustersWasm = Module.HEAP32.subarray(
      clustersPtr / INY_BYTES,
      clustersPtr / INY_BYTES + N
    );

    // Liberar la memoria reservada para `t` y `clusters`
    Module._free(jobsPtr);
    Module._free(clustersPtr);

    console.log(clustersWasm);
    const exec_time = (twasm1 - twasm0).toFixed(4);
    // Aca se guarda en el html
    createRace(N, jobs, M, clustersWasm, exec_time, 'wasmAlg');
    // setOutputHtml(clustersWasm, twasm1 - twasm0, 'WASM');
  };
};

//------//
// JS//
//------//

// Algoritmo 1//
function taskAssignment(N, Ti, M) {
  let Ci = Array.from(Array(M), () => Array(N).fill(-1));
  let tiempos = Array(M).fill(0);

  for (let i = 0; i < N; i++) {
    let min_tiempo = tiempos[0];
    let min_cluster = 0;

    for (let j = 1; j < M; j++) {
      if (tiempos[j] < min_tiempo) {
        min_tiempo = tiempos[j];
        min_cluster = j;
      }
    }

    Ci[min_cluster][i] = 1;
    tiempos[min_cluster] += Ti[i];
  }

  let lista_asignacion = [];

  for (let i = 0; i < N; i++) {
    let cluster = 0;

    for (let j = 0; j < M; j++) {
      if (Ci[j][i] !== -1) {
        cluster = j + 1;
        lista_asignacion[i] = cluster;
      }
    }
  }
  return lista_asignacion;
}

// Algoritmo 2 //
function generateAssignments(N, M) {
  const assignments = [];

  function generate(assignment, i) {
    if (i === N) {
      assignments.push(assignment.slice());
      return;
    }

    for (let j = 0; j < M; j++) {
      assignment[i] = j;
      generate(assignment, i + 1);
    }
  }

  generate([], 0);
  return assignments;
}

function calculateTimes(assignment, Ti, N, times, clusters) {
  for (let i = 0; i < N; i++) {
    const cluster = assignment[i];
    times[cluster] += Ti[i];
    clusters[cluster].push(i);
  }
}

function getMaxTime(times) {
  return Math.max(...times);
}

function clearClusters(M, clusters) {
  for (let i = 0; i < M; i++) {
    clusters[i].length = 0;
  }
}

function taskAssignment2(N, Ti, M) {
  let minTime = Infinity;
  let bestAssignment;
  const clusters = Array.from({ length: M }, () => []);

  // Generate all possible task assignments
  const assignments = generateAssignments(N, M);

  // Find the assignment with the minimum time
  for (const assignment of assignments) {
    const times = Array.from({ length: M }, () => 0);

    calculateTimes(assignment, Ti, N, times, clusters);

    const maxTime = getMaxTime(times);
    if (maxTime < minTime) {
      minTime = maxTime;
      bestAssignment = assignment.slice();
    }

    // Clear clusters for next iteration
    clearClusters(M, clusters);
  }

  // Build the task assignment list
  const assignmentList = [];
  for (let i = 0; i < N; i++) {
    const cluster = bestAssignment[i];
    assignmentList.push(cluster + 1);
  }

  return assignmentList;
}

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};
