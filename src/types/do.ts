import {
  EBandwidthNetworkInterface,
  EBandwidthTrafficDirection,
} from './../constants/enums/index';
export interface IMonitoringMetrics {
  xValues: Date[];
  yValues: number[];
}

export interface IDropletBandwidthRequest {
  hostId: string;
  start: string;
  end: string;
  networkInterface: EBandwidthNetworkInterface;
  trafficDirection: EBandwidthTrafficDirection;
}
