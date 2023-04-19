
// Wait for WASM compilation.
Module.onRuntimeInitialized = () => {
    const { findOptimalAssignment } = Module;
  
    //------//
    // WASM //
    //------//
    document.getElementById('execute_btn').onclick = () => {
        console.log('entro')
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
        console.log(outputArray)

        const result = Module.ccall("findOptimalAssignment", "array",
        ["number", "array", "number", "array"],
        [N, jobs, M, outputArray]);

        console.log(result);

        // Mostrar el resultado en la página
        var outputDiv = document.getElementById('output');
        outputDiv.innerHTML = '';
        for (var i = 0; i < M; i++) {
            outputDiv.innerHTML +=
            '<p>Cluster ' +
            (i + 1) +
            ': ' +
            outputArray.slice(i * N, (i + 1) * N).join(', ') +
            '</p>';
        }
    }

}