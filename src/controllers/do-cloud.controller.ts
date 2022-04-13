import {IDropletBandwidthRequest, IMonitoringMetrics} from './../types/do';
import {intercept, service} from '@loopback/core';
import {get, post, requestBody, response} from '@loopback/rest';
import {IGetAccountApiResponse} from 'dots-wrapper/dist/account';
import {doCloudAuthInterceptor} from '../interceptors';
import {DOCloudService} from '../services';

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

  @get(`${BASE_BATH}/monitoring/metrics/bandwidth`)
  @intercept(doCloudAuthInterceptor)
  @response(200)
  async doDropletBandwidthMonitoring(
    @requestBody() dropletBandwidthRequest: IDropletBandwidthRequest,
  ): Promise<IMonitoringMetrics> {
    const dropletBandwidthMetrics =
      await this.doCloudService.getDropletBandwidthMetrics(
        dropletBandwidthRequest,
      );
    return dropletBandwidthMetrics;
  }
}
