import {GetDropletCpuMetricsResponse} from 'dots-wrapper/dist/monitoring';
import {first, get, isEmpty} from 'lodash';
import {IMonitoringMetrics, TMonitoringValues} from '../types/monitoring';
import {calculateUsedCPUPercentage} from './cpu-calculate';

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

export function getUsedCPUPercentage(
  cpuMetrics: GetDropletCpuMetricsResponse,
): (string | number)[][] {
  const calculatedMetricResult: (string | number)[][] = [];
  const cpuMetricsResult = get(cpuMetrics, 'data.data.result');

  const MOCK_TIMESTAMP = 1649510700;

  const usedCPUPercentage = calculateUsedCPUPercentage(
    MOCK_TIMESTAMP,
    cpuMetricsResult,
  );

  return calculatedMetricResult;
}

export function getValueByTimestamp(
  timestamp: number,
  values: TMonitoringValues,
): number {
  if (isEmpty(values)) {
    return 0;
  }

  const pairValue = values.find(item => {
    const [currentTimeStamp] = item;
    return currentTimeStamp === timestamp;
  });
  const value = get(pairValue, '[1]');

  return value ? Number(value) : 0;
}
