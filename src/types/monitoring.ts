export interface IMonitoringMetrics {
  xValues: Date[];
  yValues: number[];
}

export type TMonitoringValues = Array<Array<number | string>>;

export interface IMonitoringMetricsResult {
  metric: {
    host_id: string;
  };
  values: TMonitoringValues;
}
