#include <stdlib.h>
#include <string.h>

int* findOptimalAssignment(int N, int *jobs, int M, int *result) {
    // Inicializar las variables
    int i, j, k, min_time, min_index;
    int *times = (int *) malloc(M * sizeof(int));
    int *assigned = (int *) malloc(N * sizeof(int));

    // Asignar todos los trabajos al primer cluster
    memset(assigned, 0, N * sizeof(int));

    // Asignar los trabajos a los clusters restantes
    for (i = 0; i < M; i++) {
        // Calcular los tiempos de ejecución para cada cluster
        for (j = 0; j < M; j++) {
            times[j] = 0;
        }
        for (j = 0; j < N; j++) {
            min_time = times[0] + jobs[j];
            min_index = 0;
            for (k = 1; k < M; k++) {
                if (times[k] + jobs[j] < min_time) {
                    min_time = times[k] + jobs[j];
                    min_index = k;
                }
            }
            times[min_index] += jobs[j];
            assigned[j] = min_index;
        }

        // Copiar los resultados en el array de salida
        for (j = 0; j < N; j++) {
            result[i * N + j] = assigned[j];
        }
    }

    // Devolver el array de tiempos
    return result;
    // Liberar la memoria
    free(times);
    free(assigned);
}
