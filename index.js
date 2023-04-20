
// Wait for WASM compilation.
Module.onRuntimeInitialized = () => {
    const { findOptimalAssignment } = Module;
  
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

        const ptr = Module.ccall("task_assignment", "number",
        ["number", "array", "number"],
        [N, jobs, M]);

        const js_array = Module.HEAP32.subarray(ptr / 4, ptr / 4 + N)

        console.log(js_array);

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
            js_array.slice(i * N, (i + 1) * N).join(', ') +
            '</p>';
        }
    }

}