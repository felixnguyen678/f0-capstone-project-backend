import {
  EBandwidthNetworkInterface,
  EBandwidthTrafficDirection,
} from '../constants/enums/monitoring';

export interface IMonitoringMetrics {
  xValues: Date[];
  yValues: number[];
}

export interface IDropletBandwidthPayload {
  hostId: string;
  start: string;
  end: string;
  networkInterface: EBandwidthNetworkInterface;
  trafficDirection: EBandwidthTrafficDirection;
}
