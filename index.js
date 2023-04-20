
// Wait for WASM compilation.
Module.onRuntimeInitialized = () => {
    const { task_assignment } = Module;
  
    //------//
    // WASM //
    //------//
    document.getElementById('execute_btn').onclick = () => {
        // Obtener los datos de entrada del formulario
        var N = parseInt(document.getElementById('numJobs').value);
        var jobs = document
            .getElementById('jobDurations')
            .value.split(',')
            .map(function (x) {
                return parseInt(x);
            });
        var M = parseInt(document.getElementById('numClusters').value);
            
        console.log('Estos son los datos de entrada:', N, jobs, M);
        
        const jobsPtr = Module._malloc(N * 4);  // 4 bytes por cada elemento (entero de 32 bits)
        Module.HEAP32.set(jobs, jobsPtr / 4);

        const clustersPtr = Module.ccall("task_assignment", "number",
        ["number", "number", "number"],
        [N, jobsPtr, M]);

        const clusters = Module.HEAP32.subarray(clustersPtr / 4, clustersPtr / 4 + N*M);
        
        // Liberar la memoria reservada para `t` y `clusters`
        Module._free(jobsPtr);
        Module._free(clustersPtr);

        console.log(clusters);
        
        // findOptimalAssignment(N, jobs, M, outputArray.byteOffset);
        // console.log(`[${outputArray.join(", ")}]`);
        

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

}