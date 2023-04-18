# Generar módulo Wasm y el archivo Javascript de unión

1   Instalar Emscripten siguiendo las instrucciones en https://emscripten.org/docs/getting_started/downloads.html.

2   Compilar el código en C a WebAssembly generando el codigo Javascritp de unión usando el siguiente comando en la terminal:

    emcc -O3 -s WASM=1 -s MAIN_MODULE=1 -s EXPORTED_RUNTIME_METHODS= "['cwrap', 'ccall']" -o optimal-assignment.js optimal-assignment.c

"-O3": habilita la optimización de nivel 3.
"-s WASM=1": especifica que se debe generar un módulo WebAssembly en lugar de JavaScript.
"-s MAIN_MODULE=1": indica que se debe generar un módulo WebAssembly que se cargará como un módulo principal. Esto permite que el módulo sea utilizado como una biblioteca desde otros módulos WebAssembly.
"-s EXPORTED_RUNTIME_METHODS=['cwrap', 'ccall']": exporta los métodos "cwrap" y "ccall" de Emscripten, que permiten llamar a funciones C desde JavaScript. Dónde:
**ccall**: calls a compiled C function with the specified variables and return the result.
**cwrap**: "wraps" a compiled C function and returns a JavaScript function you can call normally. That is, by far, more useful and we will focus on this method.
"-o optimal-assignment.js optimal-assignment.c": indica que el resultado de la compilación debe ser un archivo JavaScript llamado "optimal-assignment.js" y se basa en el archivo fuente "optimal-assignment.c".

3 Limpiar cahce de emcc

    emcc --clear-cache