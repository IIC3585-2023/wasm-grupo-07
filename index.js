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

        // Para algoritmo 1 ocupar
        // const clustersPtr = Module.ccall("task_assignment", "number",
        // ["number", "number", "number"],
        // [N, jobsPtr, M]);

        // Para algoritmo 2 ocupar
        const clustersPtr = Module.ccall("task_assignment2", "number",
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
// JS//
//------//
document.getElementById('execute_js_btn').onclick = () => {
    [N,jobs,M] = getData()
    // Para algoritmo 1 ocupar
    // const clusters = taskAssignment(N, jobs, M)
    // Para algoritmo 2 ocupar
    const clusters = taskAssignment2(N, jobs, M)
    console.log(clusters);
    setHtml(clusters)
}

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
  