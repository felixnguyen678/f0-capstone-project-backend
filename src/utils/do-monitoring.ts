import {GetDropletCpuMetricsResponse} from 'dots-wrapper/dist/monitoring';
import {first, get} from 'lodash';
import {IMonitoringMetrics} from '../types/monitoring';

export function convertValuesToChartData(
  values: (string | number)[][],
): IMonitoringMetrics {
  const metrics: IMonitoringMetrics = {xValues: [], yValues: []};

  if (Array.isArray(values)) {
    values.forEach(value => {
      const timestamp = Number(first(value));
      const date = new Date(timestamp * 1000);
      metrics.xValues.push(date);

      const yValue = Number(get(value, '[1]'));
      metrics.yValues.push(yValue);
    });
  }

  return metrics;
}

export function calculateUsedMemoryPercentage(
  availableMemoryValues: (string | number)[][],
  totalMemoryValues: (string | number)[][],
): (string | number)[][] {
  const usedMemoryValues: (string | number)[][] = [];

  if (
    Array.isArray(totalMemoryValues) &&
    Array.isArray(availableMemoryValues)
  ) {
    totalMemoryValues.forEach((values, index) => {
      // INFO: used memory percentage will be equal to 1 - ( available memory / total memory)
      const timestamp = String(first(values));
      const usedMemoryPercentage =
        1 -
        Number(get(availableMemoryValues, `[${index}][1]`)) /
          Number(get(values, '[1]'));

      const newValues: (string | number)[] = [timestamp, usedMemoryPercentage];
      usedMemoryValues.push(newValues);
    });
  }

  return usedMemoryValues;
}

export function calculateUsedCPUPercentage(
  cpuMetrics: GetDropletCpuMetricsResponse,
): (string | number)[][] {
  // INFO: % CPU = 1 - idle / total
  const calculatedMetricResult: (string | number)[][] = [];
  const cpuMetricsResult = get(cpuMetrics, 'data.data.result');
  if (Array.isArray(cpuMetricsResult)) {
    const idleMetric = first(
      cpuMetricsResult.filter(
        cpuMetric => get(cpuMetric, 'metric.mode') === 'idle',
      ),
    );
    const idleMetricValues = get(idleMetric, 'values');

    // if(Array.isArray(idleMetricValues) && Array.isArray(totalMetricValues)) {
    //   idleMetricValues.forEach((values, index) => {
    //     const timestamp = String(first(values))
    //       const temporaryValue = 1 -  Number(get(values, '[1]')) / Number(get(totalMetricValues, `[${index}][1]`))

    //       const newValues: (string | number)[] = [
    //         timestamp,
    //         temporaryValue,
    //       ];

    //       calculatedMetricResult.push(newValues)
    //   })
    // }
  }

  return calculatedMetricResult;
}
