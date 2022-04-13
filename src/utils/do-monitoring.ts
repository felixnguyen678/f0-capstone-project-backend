import {IMonitoringMetrics} from './../types/do';

export function convertValuesToChartData(
  values: (string | number)[][],
): IMonitoringMetrics {
  const metrics: IMonitoringMetrics = {xValues: [], yValues: []};
  values.forEach(value => {
    const timestamp = value[0] as number;
    const date = new Date(timestamp * 1000);
    metrics.xValues.push(date);
    const yValue = value[1] as number;
    metrics.yValues.push(yValue);
  });
  return metrics;
}
