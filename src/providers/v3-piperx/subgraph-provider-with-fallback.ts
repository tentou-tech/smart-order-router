import { Protocol } from '@tentou-tech/uniswap-router-sdk';

import { SubgraphProviderWithFallBacks } from '../subgraph-provider-with-fallback';

import { IV3PiperxSubgraphProvider, V3PiperxSubgraphPool } from './subgraph-provider';
/**
 * Provider for getting V3 subgraph pools that falls back to a different provider
 * in the event of failure.
 *
 * @export
 * @class V3SubgraphProviderWithFallBacks
 */
export class V3PiperxSubgraphProviderWithFallBacks
  extends SubgraphProviderWithFallBacks<V3PiperxSubgraphPool>
  implements IV3PiperxSubgraphProvider
{
  constructor(fallbacks: IV3PiperxSubgraphProvider[]) {
    super(fallbacks, Protocol.V3);
  }
}
