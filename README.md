# Generar módulo Wasm y el archivo Javascript de unión

1   Instalar Emscripten siguiendo las instrucciones en https://emscripten.org/docs/getting_started/downloads.html.

2   Compilar el código en C a WebAssembly generando el codigo Javascritp de unión usando el siguiente comando en la terminal:

    emcc -O3 -s EXPORTED_FUNCTIONS=_task_assignment,_task_assignment2,_malloc,_free -s EXPORTED_RUNTIME_METHODS=ccall -o main.js main.c

"-O3": habilita la optimización de nivel 3.
"-s EXPORTED_RUNTIME_METHODS=ccall: exporta el método "ccall" de Emscripten, que permiten llamar a funciones C desde JavaScript. Dónde:
**ccall**: calls a compiled C function with the specified variables and return the result.
**cwrap**: "wraps" a compiled C function and returns a JavaScript function you can call normally. That is, by far, more useful and we will focus on this method.
"-o main.js algoritmo2.c": indica que el resultado de la compilación debe ser un archivo JavaScript llamado "main.js" y se basa en el archivo fuente "algoritmo2.c".

3 Limpiar cahce de emcc

    emcc --clear-cache