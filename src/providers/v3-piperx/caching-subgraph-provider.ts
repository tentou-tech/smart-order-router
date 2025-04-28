import { Protocol } from '@tentou-tech/uniswap-router-sdk';
import { ChainId } from '@tentou-tech/uniswap-sdk-core';

import { ICache } from '../cache';
import { CachingSubgraphProvider } from '../caching-subgraph-provider';

import {
  IV3PiperxSubgraphProvider,
  V3PiperxSubgraphPool,
} from './subgraph-provider';
/**
 * Provider for getting V3 pools, with functionality for caching the results.
 *
 * @export
 * @class CachingV3PiperxSubgraphProvider
 */
export class CachingV3PiperxSubgraphProvider
  extends CachingSubgraphProvider<V3PiperxSubgraphPool>
  implements IV3PiperxSubgraphProvider
{
  /**
   * Creates an instance of CachingV3SubgraphProvider.
   * @param chainId The chain id to use.
   * @param subgraphProvider The provider to use to get the subgraph pools when not in the cache.
   * @param cache Cache instance to hold cached pools.
   */
  constructor(
    chainId: ChainId,
    subgraphProvider: IV3PiperxSubgraphProvider,
    cache: ICache<V3PiperxSubgraphPool[]>
  ) {
    super(chainId, subgraphProvider, cache, Protocol.V3);
  }
}
