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
