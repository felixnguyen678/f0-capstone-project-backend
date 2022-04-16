import get from 'lodash/get';
import {IMonitoringMetricsResult, TMonitoringValues} from '../types';
import {ECPUMetricMode} from '../types/CPU';
import {getValueByTimestamp} from './do-monitoring';

export function calculateCPUTotal(
  timestamp: number,
  cpuMetricsResult: IMonitoringMetricsResult[],
): number {
  if (!Array.isArray(cpuMetricsResult)) {
    return 0;
  }

  const total = cpuMetricsResult.reduce((previousValue, currentItem) => {
    const currentValues = get(currentItem, 'values');
    const currentValue = getValueByTimestamp(timestamp, currentValues);

    return previousValue + currentValue;
  }, 0);

  return total;
}

export function getValueWithIdleModeCPU(
  timestamp: number,
  cpuMetricsResult: IMonitoringMetricsResult[],
): number {
  if (!Array.isArray(cpuMetricsResult)) {
    return 0;
  }

  const idleModeCPU = cpuMetricsResult.find(item => {
    const mode = get(item, 'metric.mode');
    return mode === ECPUMetricMode.IDLE;
  });

  const values = get(idleModeCPU, 'values') as TMonitoringValues;

  const value = getValueByTimestamp(timestamp, values);

  return value;
}

export function calculateUsedCPUPercentage(
  timestamp: number,
  cpuMetricsResult: IMonitoringMetricsResult[],
): number {
  const cpuTotalValue = calculateCPUTotal(timestamp, cpuMetricsResult);

  const cpuIdleValue = getValueWithIdleModeCPU(timestamp, cpuMetricsResult);

  // INFO: % CPU = 1 - idle / total
  return 1 - cpuIdleValue / cpuTotalValue;
}
