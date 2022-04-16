import {
  EBandwidthNetworkInterface,
  EBandwidthTrafficDirection,
} from '../constants/enums/monitoring';

export interface IMonitoringMetrics {
  xValues: Date[];
  yValues: number[];
}
