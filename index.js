const INY_BYTES = 4 //4 bytes por cada elemento (entero de 32 bits)


//------//
// Utilidades //
//------//
function setHtml(clusters) {
    // Mostrar el resultado en la página
    var outputDiv = document.getElementById('output');
    outputDiv.innerHTML = '';
    for (var i = 0; i < M; i++) {
        outputDiv.innerHTML +=
        '<p>Cluster ' +
        (i + 1) +
        ': ' +
        clusters.slice(i * N, (i + 1) * N).join(', ') +
        '</p>';
    }
}

function getData(){
    // Obtener los datos de entrada del formulario
    var N = parseInt(document.getElementById('numJobs').value);
    var jobs = document
        .getElementById('jobDurations')
        .value.split(',')
        .map(function (x) {
            return parseInt(x);
        });
    var M = parseInt(document.getElementById('numClusters').value);
    return [N,jobs,M]
}


//------//
// WASM //
//------//
// Wait for WASM compilation.
Module.onRuntimeInitialized = () => {
    document.getElementById('execute_wasm_btn').onclick = () => {
        
        [N,jobs,M] = getData()
        console.log('Estos son los datos de entrada:', N, jobs, M);
        
        const jobsPtr = Module._malloc(N * INY_BYTES);
        Module.HEAP32.set(jobs, jobsPtr / INY_BYTES);

        const clustersPtr = Module.ccall("task_assignment", "number",
        ["number", "number", "number"],
        [N, jobsPtr, M]);

        const clusters = Module.HEAP32.subarray(clustersPtr / INY_BYTES, clustersPtr / INY_BYTES + N);
        
        // Liberar la memoria reservada para `t` y `clusters`
        Module._free(jobsPtr);
        Module._free(clustersPtr);

        console.log(clusters);
        setHtml(clusters)
    }
}


//------//
// JS Algoritmo 2//
//------//
document.getElementById('execute_js_btn').onclick = () => {
    [N,jobs,M] = getData()
    const clusters = task_assignment(N, jobs, M)
    console.log(clusters);
    setHtml(clusters)
}

function task_assignment(N, Ti, M) {
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