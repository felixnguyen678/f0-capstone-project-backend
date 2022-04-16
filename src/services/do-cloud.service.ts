import {inject} from '@loopback/core';
import {HttpErrors, Request, RestBindings} from '@loopback/rest';
import {createApiClient} from 'dots-wrapper';
import {IGetAccountApiResponse} from 'dots-wrapper/dist/account';
import {IListDropletsApiResponse} from 'dots-wrapper/dist/droplet';
import get from 'lodash/get';
import {ERequestHeader} from '../constants/enums';
import {IMonitoringMetrics} from '../types/monitoring';
import {
  calculateUsedMemoryPercentage,
  convertValuesToChartData,
  getUsedCPUPercentage,
} from '../utils/do-monitoring';
import {convertDateTo10DigitsTimestamp} from '../utils/timestamp';
import {
  EBandwidthNetworkInterface,
  EBandwidthTrafficDirection,
} from './../constants/enums/monitoring';

export class DOCloudService {
  private apiClient;

  constructor(@inject(RestBindings.Http.REQUEST) private request: Request) {
    const doToken = this.request.headers[ERequestHeader.DO_Authorization];

    this.apiClient = createApiClient({token: `${doToken}`});
  }

  async getAccount(): Promise<IGetAccountApiResponse> {
    const response = await this.apiClient.account.getAccount();

    return response.data;
  }

  async getDroplets(): Promise<IListDropletsApiResponse> {
    const input = {
      per_page: 100,
    };
    const response = await this.apiClient.droplet.listDroplets(input);

    return response.data;
  }

  async getDropletBandwidthMetrics(
    hostId: string,
    start: string,
    end: string,
    networkInterface: EBandwidthNetworkInterface,
    trafficDirection: EBandwidthTrafficDirection,
  ): Promise<IMonitoringMetrics> {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const startTimestamp = convertDateTo10DigitsTimestamp(startDate);
    const endTimestamp = convertDateTo10DigitsTimestamp(endDate);

    let metrics: IMonitoringMetrics = {xValues: [], yValues: []};

    try {
      const response =
        await this.apiClient.monitoring.getDropletBandwidthMetrics({
          host_id: hostId,
          start: startTimestamp,
          end: endTimestamp,
          network_interface: networkInterface,
          traffic_direction: trafficDirection,
        });

      const values = get(response, 'data.data.result[0].values');
      metrics = Array.isArray(values)
        ? convertValuesToChartData(values)
        : metrics;
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpErrors[400]('Bad Request Error');
      }
    }

    return metrics;
  }

  async getDropletUsedMemoryMetrics(
    hostId: string,
    start: string,
    end: string,
  ): Promise<IMonitoringMetrics> {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const startTimestamp = convertDateTo10DigitsTimestamp(startDate);
    const endTimestamp = convertDateTo10DigitsTimestamp(endDate);

    let metrics: IMonitoringMetrics = {xValues: [], yValues: []};

    try {
      const totalMemoryResponse =
        await this.apiClient.monitoring.getDropletTotalMemoryMetrics({
          host_id: hostId,
          start: startTimestamp,
          end: endTimestamp,
        });

      const availableMemoryResponse =
        await this.apiClient.monitoring.getDropletAvailableMemoryMetrics({
          host_id: hostId,
          start: startTimestamp,
          end: endTimestamp,
        });

      const totalMemoryValues = get(
        totalMemoryResponse,
        'data.data.result[0].values',
      );
      const availableMemoryValues = get(
        availableMemoryResponse,
        'data.data.result[0].values',
      );

      if (totalMemoryValues && availableMemoryValues) {
        const usedMemoryValues = calculateUsedMemoryPercentage(
          availableMemoryValues,
          totalMemoryValues,
        );
        metrics = convertValuesToChartData(usedMemoryValues);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpErrors[400]('Bad Request Error');
      }
    }

    return metrics;
  }

  async getDropletCPUMetrics(
    hostId: string,
    start: string,
    end: string,
  ): Promise<IMonitoringMetrics> {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const startTimestamp = convertDateTo10DigitsTimestamp(startDate);
    const endTimestamp = convertDateTo10DigitsTimestamp(endDate);

    let metrics: IMonitoringMetrics = {xValues: [], yValues: []};

    try {
      const response = await this.apiClient.monitoring.getDropletCpuMetrics({
        host_id: hostId,
        start: startTimestamp,
        end: endTimestamp,
      });

      const values = getUsedCPUPercentage(response);

      metrics = Array.isArray(values)
        ? convertValuesToChartData(values)
        : metrics;
    } catch (error) {
      console.log({error});
      if (error instanceof Error) {
        throw new HttpErrors[400]('Bad Request Error');
      }
    }

    return metrics;
  }
}
