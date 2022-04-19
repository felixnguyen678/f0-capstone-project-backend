import {inject} from '@loopback/core';
import {HttpErrors, Request, RestBindings} from '@loopback/rest';
import {createApiClient} from 'dots-wrapper';
import {IGetAccountApiResponse} from 'dots-wrapper/dist/account';
import {
  IGetDropletApiResponse,
  IListDropletsApiResponse,
} from 'dots-wrapper/dist/droplet';
import get from 'lodash/get';
import {Config, NodeSSH} from 'node-ssh';
import path from 'path';
import {DEFAULT_PRIVATE_KEY_FILE_NAME} from '../constants';
import {
  DOCKER_CONTAINER_FORMAT,
  DOCKER_CONTAINER_STATS_FORMAT,
} from '../constants/docker-cmd';
import {ERequestHeader} from '../constants/enums';
import {IMonitoringMetrics} from '../types/monitoring';
import {convertStringToContainerList} from '../utils/container';
import {
  calculateUsedMemoryPercentage,
  convertValuesToChartData,
  getUsedCPUPercentage,
  optimizeCPUMetricsResponse,
} from '../utils/do-monitoring';
import {convertDateTo10DigitsTimestamp} from '../utils/timestamp';
import {
  EBandwidthNetworkInterface,
  EBandwidthTrafficDirection,
} from './../constants/enums/monitoring';
import {IContainer, TContainerList} from './../types/container';

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

  async getDropletById(hostId: string): Promise<IGetDropletApiResponse> {
    const dropletId = Number(hostId);
    const response = await this.apiClient.droplet.getDroplet({
      droplet_id: dropletId,
    });

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

      const optimizedResponse = optimizeCPUMetricsResponse(response);

      const values = getUsedCPUPercentage(optimizedResponse);

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

  async getDropletIPv4Address(hostId: string): Promise<string> {
    try {
      const droplet = await this.getDropletById(hostId);
      const ipAddress = get(droplet, 'droplet.networks.v4[0].ip_address');

      if (!ipAddress) {
        throw new HttpErrors[400]('Bad Request Error');
      }

      return ipAddress;
    } catch (error) {
      throw new HttpErrors[400](error.message);
    }
  }

  public async getDefaultSSHConfig(hostId: string): Promise<Config> {
    const ipAddress = await this.getDropletIPv4Address(hostId);

    const privateKeyFilePath = path.resolve(
      __dirname,
      `../../keys/${DEFAULT_PRIVATE_KEY_FILE_NAME}`,
    );

    return {
      host: ipAddress,
      username: 'root',
      privateKey: privateKeyFilePath,
    };
  }

  async getDropletContainerList(hostId: string): Promise<TContainerList> {
    let containerList: TContainerList = [];
    const getContainerListCommand = `docker ps -a --format ${DOCKER_CONTAINER_FORMAT}`;

    try {
      const ssh = new NodeSSH();
      const config = await this.getDefaultSSHConfig(hostId);
      await ssh.connect(config);

      const commandResult = await ssh.exec(getContainerListCommand, []);
      containerList = convertStringToContainerList(commandResult);
    } catch (error) {
      // INFO: may be droplet haven't installed docker yet
      throw new HttpErrors[500]('Internal Server Error');
    }

    return containerList;
  }
  async getDropletContainer(
    hostId: string,
    containerId: string,
  ): Promise<IContainer> {
    try {
      const ssh = new NodeSSH();
      const config = await this.getDefaultSSHConfig(hostId);
      await ssh.connect(config);

      // INFO: get docker container details
      const getContainerCommand = `docker ps --filter "id=${containerId}" --format ${DOCKER_CONTAINER_FORMAT}`;
      const getContainerCommandResult = await ssh.exec(getContainerCommand, []);
      const container = JSON.parse(getContainerCommandResult);

      // INFO: get docker container stats
      const getContainerStatsCommand = `docker stats --no-stream --format ${DOCKER_CONTAINER_STATS_FORMAT} ${containerId}`;
      const getContainerStatsCommandResult = await ssh.exec(
        getContainerStatsCommand,
        [],
      );
      const statsData = JSON.parse(getContainerStatsCommandResult);

      if (statsData) {
        container.stats = statsData;
      }

      return container;
    } catch (error) {
      throw new HttpErrors[500]('Internal Server Error');
    }
  }

  async startDropletContainer(
    hostId: string,
    containerId: string,
  ): Promise<void> {
    try {
      const ssh = new NodeSSH();
      const config = await this.getDefaultSSHConfig(hostId);
      await ssh.connect(config);

      const startContainerCommand = `docker start ${containerId}`;
      await ssh.exec(startContainerCommand, []);
    } catch (error) {
      throw new HttpErrors[500]('Internal Server Error');
    }
  }

  async restartDropletContainer(
    hostId: string,
    containerId: string,
  ): Promise<void> {
    try {
      const ssh = new NodeSSH();
      const config = await this.getDefaultSSHConfig(hostId);
      await ssh.connect(config);

      const restartContainerCommand = `docker restart ${containerId}`;
      await ssh.exec(restartContainerCommand, []);
    } catch (error) {
      throw new HttpErrors[500]('Internal Server Error');
    }
  }

  async stopDropletContainer(
    hostId: string,
    containerId: string,
  ): Promise<void> {
    try {
      const ssh = new NodeSSH();
      const config = await this.getDefaultSSHConfig(hostId);
      await ssh.connect(config);

      const stopContainerCommand = `docker stop ${containerId}`;
      await ssh.exec(stopContainerCommand, []);
    } catch (error) {
      throw new HttpErrors[500]('Internal Server Error');
    }
  }

  async removeDropletContainer(
    hostId: string,
    containerId: string,
  ): Promise<void> {
    try {
      const ssh = new NodeSSH();
      const config = await this.getDefaultSSHConfig(hostId);
      await ssh.connect(config);

      const removeContainerCommand = `docker rm --force ${containerId}`;

      console.log({removeContainerCommand});

      await ssh.exec(removeContainerCommand, []);
    } catch (error) {
      throw new HttpErrors[500]('Internal Server Error');
    }
  }
}
