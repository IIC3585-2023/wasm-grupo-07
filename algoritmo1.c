#include <stdio.h>
#include <stdlib.h>

#define MAX_N 100
#define MAX_M 100

int cmp(const void *a, const void *b)
{
    return (int *)b - (int *)a; // ordenar en orden descendente
}

int min(int a, int b)
{
    return a < b ? a : b;
}

int *task_assignment(int n, int jobs[], int m)
{
    int i, j, k, t;
    int times[MAX_N];                // tiempos de ejecución de cada trabajo
    int cluster_times[MAX_M];        // tiempos totales de ejecución de cada cluster
    int assigned_jobs[MAX_M][MAX_N]; // trabajos asignados a cada cluster
    int num_assigned_jobs[MAX_M];    // número de trabajos asignados a cada cluster
    int *result = malloc(n * m * sizeof(int));

    // copiar tiempos de trabajos en un array temporal
    for (i = 0; i < n; i++)
    {
        times[i] = jobs[i];
    }

    qsort(times, n, sizeof(int), cmp); // ordenar tiempos

    // inicializar tiempos de los clusters y trabajos asignados a cero
    for (j = 0; j < m; j++)
    {
        cluster_times[j] = 0;
        num_assigned_jobs[j] = 0;
        for (i = 0; i < n; i++)
        {
            assigned_jobs[j][i] = 0;
        }
    }

    // asignar trabajos a clusters
    for (i = 0; i < n; i++)
    {
        // encontrar cluster con tiempo mínimo actual
        j = 0;
        for (k = 1; k < m; k++)
        {
            if (cluster_times[k] < cluster_times[j])
            {
                j = k;
            }
        }
        // asignar trabajo a cluster y actualizar tiempo total
        assigned_jobs[j][num_assigned_jobs[j]] = times[i];
        num_assigned_jobs[j]++;
        cluster_times[j] += times[i];
    }

    // copiar tiempos de trabajos asignados a cada cluster en array result
    for (j = 0; j < m; j++)
    {
        for (i = 0; i < n; i++)
        {
            result[j * n + i] = assigned_jobs[j][i];
        }
    }
    return result;
}