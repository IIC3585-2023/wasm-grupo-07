# Generar módulo Wasm y el archivo Javascript de unión

1   Instalar Emscripten siguiendo las instrucciones en https://emscripten.org/docs/getting_started/downloads.html.

2   Compilar el código en C a WebAssembly generando el codigo Javascritp de unión usando el siguiente comando en la terminal:

    emcc -O3 -s WASM=1 -s MAIN_MODULE=1 -s EXPORTED_FUNCTIONS="['_findOptimalAssignment']" -o optimal-assignment.js optimal-assignment.c

Este comando compila el código en C a WebAssembly con la optimización de nivel 3, habilita la generación de módulos WASM, expone la función findOptimalAssignment y genera el archivo optimal-assignment.wasm y optimal-assignment.js
El flag -s MAIN_MODULE=1 indica que el módulo wasm generado es un módulo principal y no necesita una función main

3 Limpiar cahce de emcc

    emcc --clear-cache