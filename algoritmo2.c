#include <stdio.h>
#include <stdlib.h>

int* task_assignment(int N, int Ti[N], int M) {
  int i, j;
  int Ci[M][N];
  int tiempos[M];
  for (i = 0; i < M; i++) {
    tiempos[i] = 0;
    for (j = 0; j < N; j++) {
      Ci[i][j] = -1;
    }
  }
  for (i = 0; i < N; i++) {
    int min_tiempo = tiempos[0];  //0 - 30 - 30
    int min_cluster = 0;
    for (j = 1; j < M; j++) {   
      if (tiempos[j] < min_tiempo) { // 0 !< 0  - 0<30 // 50 !< 30
        min_tiempo = tiempos[j];  // _ - 0 - _
        min_cluster = j;  // _ - 1 - _
      }
    }
    Ci[min_cluster][i] = 1;  // c[0][0] - c[1][1] - c[0][2]
    tiempos[min_cluster] += Ti[i]; // tiempos[0] = 30 - tiempos[1] = 50 - tiempos[0] = 40
  }
  // Almacenar la asignación óptima en una lista unidimensional
  int *lista_asignacion = (int*) malloc(N * sizeof(int));
  for (i = 0; i < N; i++) {
    int cluster = 0;
    for (j = 0; j < M; j++) {
      if (Ci[j][i] != -1) {
        cluster = j + 1;
        lista_asignacion[i] = cluster;
      }
    }
  }
  return lista_asignacion;
}