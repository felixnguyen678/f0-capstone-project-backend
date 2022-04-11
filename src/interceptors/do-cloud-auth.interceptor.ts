import {Interceptor, InvocationContext} from '@loopback/core';
import {HttpErrors, RestBindings} from '@loopback/rest';
import {createApiClient} from 'dots-wrapper';
import {ERequestHeader} from '../constants/enums';

const doCloudAuthInterceptor: Interceptor = async (
  invocationCtx: InvocationContext,
  next,
) => {
  try {
    const request = await invocationCtx.get(RestBindings.Http.REQUEST, {
      optional: true,
    });
    if (!request) {
      throw new HttpErrors[401]('Unauthorized');
    }

    const doToken = request.headers[ERequestHeader.DO_Authorization];

    const apiClient = createApiClient({token: `${doToken}`});
    const response = await apiClient.account.getAccount();

    if (!response?.data?.account) {
      throw new HttpErrors[401]('Unauthorized');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new HttpErrors.Unauthorized(`Error verifying token`);
    }
  }

  const result = next();
  return result;
};

export {doCloudAuthInterceptor};
