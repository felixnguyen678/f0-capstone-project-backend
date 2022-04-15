import {intercept, service} from '@loopback/core';
import {get, post, requestBody, response} from '@loopback/rest';
import {IGetAccountApiResponse} from 'dots-wrapper/dist/account';
import {
  IGetDropletApiResponse,
  IListDropletsApiResponse,
} from 'dots-wrapper/dist/droplet';
import {doCloudAuthInterceptor} from '../interceptors';
import {DOCloudService} from '../services';
import {
  IDropletBandwidthPayload,
  IMonitoringMetrics,
} from '../types/monitoring';

const BASE_BATH = '/do-api';

export class DOCloudController {
  constructor(
    @service(DOCloudService)
    public doCloudService: DOCloudService,
  ) {}

  @post(`${BASE_BATH}/account`)
  @intercept(doCloudAuthInterceptor)
  @response(200)
  async doCloudLogin(): Promise<IGetAccountApiResponse> {
    const account = await this.doCloudService.getAccount();

    return account;
  }

  @get(`${BASE_BATH}/droplets`)
  @intercept(doCloudAuthInterceptor)
  @response(200)
  async getDroplets(): Promise<IListDropletsApiResponse> {
    const dropletList = await this.doCloudService.getDroplets();

    return dropletList;
  }

  @get(`${BASE_BATH}/monitoring/metrics/bandwidth`)
  @intercept(doCloudAuthInterceptor)
  @response(200)
  async doDropletBandwidthMonitoring(
    @requestBody() dropletBandwidthRequest: IDropletBandwidthPayload,
  ): Promise<IMonitoringMetrics> {
    const dropletBandwidthMetrics =
      await this.doCloudService.getDropletBandwidthMetrics(
        dropletBandwidthRequest,
      );
    return dropletBandwidthMetrics;
  }
}
