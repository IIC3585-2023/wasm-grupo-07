const INY_BYTES = 4; //4 bytes por cada elemento (entero de 32 bits)

//------//
// Utilidades //
//------//
function setOutputHtml(clusters, time, section) {
    // Mostrar el resultado en la página
    var outputDiv = document.getElementById('output_'+section);
    outputDiv.innerHTML = '';
    outputDiv.innerHTML += '<h3>' + section + '</h3>';
    outputDiv.innerHTML += '<h4> Time:' + time + '</h4>';
    let n_job = 1;
    for (const cluster of clusters) {
        outputDiv.innerHTML +=
        '<p> Trabajo ' + n_job + ': ' + cluster + '</p>';
        n_job ++;
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
  var N  = jobs.length
  var M = parseInt(document.getElementById('numClusters').value);
  return [N, jobs, M];
}


//------//
// WORKERS //
//------//
let progressStartValue = 0,
  progressEndValue = 100;

const createRace = (N, jobs, M, workDistribution) => {
  setUpWorkersInHtml(M);
  const workers = createWorkers(M);
  fillUpJobs(workers, jobs, workDistribution);
  startProgress(workers);
};

const setUpWorkersInHtml = (M) => {
  const container = document.querySelector('.container'); // select the container element

  for (let i = 0; i < M; i++) {
    // create the worker div element
    const workerDiv = document.createElement('div');
    workerDiv.classList.add('worker');

    // create the circular-progress div element
    const progressDiv = document.createElement('div');
    progressDiv.classList.add('circular-progress');
    progressDiv.id = `progress-worker-${i}`;

    // create the progress-value span element
    const valueSpan = document.createElement('span');
    valueSpan.classList.add('progress-value');
    valueSpan.id = `worker-${i}`;
    valueSpan.textContent = '0%';

    // append the progress-value span element to the circular-progress div element
    progressDiv.appendChild(valueSpan);

    // create the text span element
    const textSpan = document.createElement('span');
    textSpan.classList.add('text');
    textSpan.textContent = `Cluster ${i + 1}`;

    // append the circular-progress and text span elements to the worker div element
    workerDiv.appendChild(progressDiv);
    workerDiv.appendChild(textSpan);

    // append the worker div element to the container element
    container.appendChild(workerDiv);
  }
};

const createWorkers = (M) => {
  workers = [];
  for (let i = 0; i < M; i++) {
    workers.push({
      id: `Worker ${i}`,
      jobs: [],
      progress: 0,
    });
  }
  return workers;
};

const fillUpJobs = (workers, jobsToDo, workDistribution) => {
  for (let i = 0; i < jobsToDo.length; i++) {
    workers[workDistribution[i] - 1].jobs.push(jobsToDo[i]);
    console.log(workers);
  }
};

const startProgress = (workers) => {
  workers.forEach((worker, index) => {
    let workerId = index;
    let speed = worker.jobs[0] * 10;
    initJob(workerId, speed);
  });
};

const activateJob = (workerId) => {
  let circularProgressWorker = document.querySelector(
    `#progress-worker-${workerId}`
  );
  let progressWorkerValue = document.querySelector(`#worker-${workerId}`);
  progressWorkerValue.textContent = `${workers[workerId].jobs[0]}s`;
  circularProgressWorker.style.background = `conic-gradient(#7d2ae8 ${
    workers[workerId].progress * 3.6
  }deg, #ededed 0deg)`;

  if (workers[workerId].progress == progressEndValue) return true;
  return false;
};

const initJob = (workerId, speed) => {
  let timer = setInterval(() => {
    const isFinished = activateJob(workerId);
    workers[workerId].progress++;
    if (isFinished) {
      clearInterval(timer);
      if (workers[workerId].jobs.length > 1) {
        workers[workerId].progress = 0;
        workers[workerId].jobs.shift();
        speed = workers[workerId].jobs[0] * 10;
        initJob(workerId, speed);
      } else {
        finished(workerId);
      }
    }
  }, speed);
};

const finished = (workerId) => {
  let progressWorker = document.querySelector(`#worker-${workerId}`);
  progressWorker.textContent = 'Finished';
};



// Wait for WASM compilation.
Module.onRuntimeInitialized = () => {
  document.getElementById('execute_btn').onclick = () => {

    //JS//
    [N, jobs, M] = getData();
     const tjs0 = Date.now();   
    // const clusters = taskAssignment(N, jobs, M)
    const clustersJS = taskAssignment2(N, jobs, M);
    const tjs1 = Date.now();
    console.log(clustersJS);
    setOutputHtml(clustersJS, (tjs1 - tjs0) / 1000, 'JS');

    
    // WASM //
    const twasm0 = Date.now();
    console.log('Estos son los datos de entrada:', N, jobs, M);

    const jobsPtr = Module._malloc(N * INY_BYTES);
    Module.HEAP32.set(jobs, jobsPtr / INY_BYTES);

    // const clustersPtr = Module.ccall("task_assignment", "number",
    // ["number", "number", "number"],
    // [N, jobsPtr, M]);

    const clustersPtr = Module.ccall(
      'task_assignment2',
      'number',
      ['number', 'number', 'number'],
      [N, jobsPtr, M]
    );

    const clustersWasm = Module.HEAP32.subarray(
      clustersPtr / INY_BYTES,
      clustersPtr / INY_BYTES + N
    );

    // Liberar la memoria reservada para `t` y `clusters`
    Module._free(jobsPtr);
    Module._free(clustersPtr);
    const twasm1 = Date.now();

    console.log(clustersWasm);

    // Aca se guarda en el html
    createRace(N, jobs, M, clustersWasm);
    setOutputHtml(clustersWasm, (twasm1 - twasm0) / 1000, 'WASM');
    
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

