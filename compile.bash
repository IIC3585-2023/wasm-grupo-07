#!/usr/bin/env bash

emcc -O3 -s EXPORTED_FUNCTIONS=_findOptimalAssignment -s EXPORTED_RUNTIME_METHODS=ccall -o main.js main.c
