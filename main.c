#include <stdio.h>
#include <stdlib.h>
#include <limits.h>
#include <math.h>

// Algoritmo 1
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
    int min_tiempo = tiempos[0]; 
    int min_cluster = 0;
    for (j = 1; j < M; j++) {   
      if (tiempos[j] < min_tiempo) { 
        min_tiempo = tiempos[j];  
        min_cluster = j; 
      }
    }
    Ci[min_cluster][i] = 1; 
    tiempos[min_cluster] += Ti[i]; 
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

// Algoritmo 2

void generate_assignments(int* assignment, int assignment_index, int N, int M, int** all_assignments, int* num_assignments) {
  if (assignment_index == N) {
    int* new_assignment = malloc(N * sizeof(int));
    for (int i = 0; i < N; i++) {
      new_assignment[i] = assignment[i];
    }
    all_assignments[*num_assignments] = new_assignment;
    (*num_assignments)++;
    return;
  }

  for (int i = 0; i < M; i++) {
    assignment[assignment_index] = i;
    generate_assignments(assignment, assignment_index + 1, N, M, all_assignments, num_assignments);
  }
}

void calculate_times(int* assignment, int* Ti, int N, int M, int* times, int** clusters) {
  for (int i = 0; i < N; i++) {
    int cluster = assignment[i];
    times[cluster] += Ti[i];
    clusters[cluster][i] = 1;
  }
}

int get_max_time(int* times, int M) {
    int max_time = 0;
    for (int i = 0; i < M; i++) {
        if (times[i] > max_time) {
            max_time = times[i];
        }
    }
    return max_time;
}

void clear_clusters(int M, int** clusters) {
    for (int i = 0; i < M; i++) {
        for (int j = 0; j < M; j++) {
            clusters[i][j] = -1;
        }
    }
}

int* task_assignment2(int N, int* Ti, int M) {
  int min_time = INT_MAX;
  int* best_assignment;
  int** clusters = malloc(M * sizeof(int*));
  for (int i = 0; i < M; i++) {
    clusters[i] = malloc(N * sizeof(int));
  }
  int* all_assignments[(int) pow(M, N)];
  int num_assignments = 0;

  // Generate all possible task assignments
  int assignment[N];
  generate_assignments(assignment, 0, N, M, all_assignments, &num_assignments);

  // Find the assignment with the minimum time
  for (int i = 0; i < num_assignments; i++) {
    int times[M];
    for (int j = 0; j < M; j++) {
      times[j] = 0;
    }

    calculate_times(all_assignments[i], Ti, N, M, times, clusters);

    int max_time = get_max_time(times, M);
    if (max_time < min_time) {
      min_time = max_time;
      best_assignment = all_assignments[i];
    }

    // Clear clusters for next iteration
    clear_clusters(M, clusters);
  }

  // Build the task assignment list
  int* assignment_list = malloc(N * sizeof(int));
  for (int i = 0; i < N; i++) {
    int cluster = best_assignment[i];
    assignment_list[i] = cluster + 1;
  }

  // Free memory
  for (int i = 0; i < M; i++) {
    free(clusters[i]);
  }
  free(clusters);
  for (int i = 0; i < num_assignments; i++) {
    free(all_assignments[i]);
  }

  return assignment_list;
}


