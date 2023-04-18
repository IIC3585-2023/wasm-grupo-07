let wasmExports = null;

let asmLibraryArg = {
  __handle_stack_overflow: () => {}, // Loggs when overflow happens
  emscripten_resize_heap: () => {}, // Logs when memory allocation exceeds limits
  __lock: () => {}, // Logs when lock is called
  __unlock: () => {}, // Logs when unlock is called
  memory: new WebAssembly.Memory({ initial: 256, maximum: 256 }), // 256 pages of memory, 16mb in total
  table: new WebAssembly.Table({ initial: 1, maximum: 1, element: 'anyfunc' }), //Investigar
};

let info = {
  env: asmLibraryArg,
  wasi_snapshot_preview1: asmLibraryArg,
};

async function loadWasm() {
  let response = await fetch('optimal-assignment.wasm');
  let bytes = await response.arrayBuffer();
  let wasmObj = await WebAssembly.instantiate(bytes, info);
  wasmExports = wasmObj.instance.exports;
}

loadWasm();
