import {GetDropletCpuMetricsResponse} from 'dots-wrapper/dist/monitoring';
import first from 'lodash/first';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import round from 'lodash/round';
import {ECPUMetricMode} from '../types/CPU';
import {
  IMonitoringMetrics,
  IMonitoringMetricsResult,
  TMonitoringValues,
} from '../types/monitoring';
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
      const formatYValue = round(yValue, 7);
      metrics.yValues.push(formatYValue);
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

  const cpuMetricsResult = get(
    cpuMetrics,
    'data.data.result',
  ) as IMonitoringMetricsResult[];

  const idleModeCPU = cpuMetricsResult.find(item => {
    const mode = get(item, 'metric.mode');
    return mode === ECPUMetricMode.IDLE;
  });

  const idleModeCPUValues = get(idleModeCPU, 'values');

  if (Array.isArray(idleModeCPUValues)) {
    idleModeCPUValues.forEach(item => {
      const [timestamp] = item;
      const usedCPUPercentage = calculateUsedCPUPercentage(
        timestamp as number,
        cpuMetricsResult,
      );
      calculatedMetricResult.push([timestamp, usedCPUPercentage]);
    });
  }

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

export function optimizeCPUMetricsResponse(
  cpuMetrics: GetDropletCpuMetricsResponse,
): GetDropletCpuMetricsResponse {
  const newCPUMetrics = {...cpuMetrics};
  const cpuMetricsResult = get(
    newCPUMetrics,
    'data.data.result',
  ) as IMonitoringMetricsResult[];

  const MIN_VALUES_COUNT = 25;
  const idleModeCPU = cpuMetricsResult.find(item => {
    const mode = get(item, 'metric.mode');
    return mode === ECPUMetricMode.IDLE;
  });
  const idleModeCPUValues = get(idleModeCPU, 'values');

  if (
    !Array.isArray(cpuMetricsResult) ||
    idleModeCPUValues!.length < MIN_VALUES_COUNT
  ) {
    return cpuMetrics;
  }

  cpuMetricsResult.forEach(item => {
    const values = get(item, 'values') as TMonitoringValues;

    const newValues = values.filter((_, index) => {
      return index % 2 === 0;
    }) as TMonitoringValues;

    item.values = newValues;
  });

  newCPUMetrics.data.data.result = cpuMetricsResult;

  return newCPUMetrics;
}
