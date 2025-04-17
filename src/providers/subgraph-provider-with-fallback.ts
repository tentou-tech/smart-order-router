import { Token } from '@tentou-tech/uniswap-sdk-core';
import { Protocol } from '@uniswap/router-sdk';
import { SubgraphPool } from '../routers/alpha-router/functions/get-candidate-pools';
import { log } from '../util';
import { ProviderConfig } from './provider';
import { ISubgraphProvider } from './subgraph-provider';

export abstract class SubgraphProviderWithFallBacks<
  TSubgraphPool extends SubgraphPool
> implements ISubgraphProvider<TSubgraphPool>
{
  protected constructor(
    private fallbacks: ISubgraphProvider<TSubgraphPool>[],
    private protocol: Protocol
  ) {}

  public async getPools(
    currencyIn?: Token,
    currencyOut?: Token,
    providerConfig?: ProviderConfig
  ): Promise<TSubgraphPool[]> {
    for (let i = 0; i < this.fallbacks.length; i++) {
      const provider = this.fallbacks[i]!;
      try {
        const pools = await provider.getPools(
          currencyIn,
          currencyOut,
          providerConfig
        );
        console.log(`Returning pools for ${this.protocol} from fallback #${i}`);
        return pools;
      } catch (err) {
        console.log(
          `Failed to get subgraph pools for ${this.protocol} from fallback #${i}`
        );
        log.info(
          `Failed to get subgraph pools for ${this.protocol} from fallback #${i}`
        );
      }
    }

    throw new Error('Failed to get subgraph pools from any providers');
  }
}
