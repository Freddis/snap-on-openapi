import {createClient, UserConfig} from '@hey-api/openapi-ts';
import {OpenApi} from '../../OpenApi';
import {AnyConfig} from '../../types/config/AnyConfig';
import {parse} from 'yaml';

export class ClientGenerator<
  TRouteTypes extends string,
  TErrorCodes extends string,
  TConfig extends AnyConfig<TRouteTypes, TErrorCodes>> {
  protected api: OpenApi<TRouteTypes, TErrorCodes, TConfig>;

  constructor(api :OpenApi<TRouteTypes, TErrorCodes, TConfig>) {
    this.api = api;
  }
  async generate(config: Partial<Omit<UserConfig, 'input'>> = {}) {
    const obj = parse(this.api.schemaGenerator.getYaml());
    const conf: UserConfig = {
      ...this.getDefaultConfig(),
      ...config,
      input: {
        path: obj,
      },
    };
    createClient(conf);
  }

  protected getDefaultConfig(): Omit<UserConfig, 'input'> {
    const config: Omit<UserConfig, 'input'> = {
      output: {
        path: './open-api-client',
      },
      plugins: [
        {
          name: '@hey-api/client-axios',
          throwOnError: false,
        },
        {
          name: '@tanstack/react-query',
        },
        {
          name: '@hey-api/transformers',
          dates: true,
        },
        {
          name: '@hey-api/sdk',
          transformer: true,
        },
        {
          name: '@hey-api/typescript',
          enums: 'javascript',
        },
      ],
    };
    return config;
  }

}
