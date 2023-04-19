
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
            
            // Setear array
        let offset = 0;
        const buffer = new ArrayBuffer(256 )
        const outputArray = new Int32Array(buffer, offset, N * M);
        
        // findOptimalAssignment = Module.cwrap('findOptimalAssignment', 'number', ['number', 'array', 'number', 'array']);
        console.log('entro')
        
        const result = Module.ccall("task_assignment", "number",
        ["number", "array", "number"],
        [N, jobs, M]);

        // const result = findOptimalAssignment(N, jobs, M, outputArray);

        var js_array = Module.HEAPU8.subarray(result, result + N*M);
        console.log(js_array);

        // findOptimalAssignment(N, jobs, M, outputArray.byteOffset);
        // console.log(`[${outputArray.join(", ")}]`);
        
        console.log(outputArray)
        console.log(result);

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