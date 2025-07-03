import { BigNumber } from '@ethersproject/bignumber';
import { Protocol } from '@tentou-tech/uniswap-router-sdk';
import { ChainId, Token } from '@tentou-tech/uniswap-sdk-core';
import { computePoolAddress } from '@tentou-tech/uniswap-v3-sdk';
import { FeeAmount, Pool } from '@tentou-tech/uniswap-v3s1-sdk';
import retry, { Options as RetryOptions } from 'async-retry';

import { IUniswapV3PoolState__factory } from '../../types/v3/factories/IUniswapV3PoolState__factory';
import { V3S1_CORE_FACTORY_ADDRESSES } from '../../util/addresses';
import { DEXES } from '../../util/constants';
import { log } from '../../util/log';
import { IMulticallProvider, Result } from '../multicall-provider';
import { ILiquidity, ISlot0, PoolProvider } from '../pool-provider';
import { ProviderConfig } from '../provider';

type V3ISlot0 = ISlot0 & {
  sqrtPriceX96: BigNumber;
  tick: number;
};

type V3ILiquidity = ILiquidity;

/**
 * Provider or getting V3 pools.
 *
 * @export
 * @interface IV3PiperxPoolProvider
 */
export interface IV3PiperxPoolProvider {
  /**
   * Gets the specified pools.
   *
   * @param tokenPairs The token pairs and fee amount of the pools to get.
   * @param [providerConfig] The provider config.
   * @returns A pool accessor with methods for accessing the pools.
   */
  getPools(
    tokenPairs: [Token, Token, FeeAmount][],
    providerConfig?: ProviderConfig
  ): Promise<V3PiperxPoolAccessor>;

  /**
   * Gets the pool address for the specified token pair and fee tier.
   *
   * @param tokenA Token A in the pool.
   * @param tokenB Token B in the pool.
   * @param feeAmount The fee amount of the pool.
   * @returns The pool address and the two tokens.
   */
  getPoolAddress(
    tokenA: Token,
    tokenB: Token,
    feeAmount: FeeAmount
  ): { poolAddress: string; token0: Token; token1: Token };
}

export type V3PiperxPoolAccessor = {
  getPool: (
    tokenA: Token,
    tokenB: Token,
    feeAmount: FeeAmount
  ) => Pool | undefined;
  getPoolByAddress: (address: string) => Pool | undefined;
  getAllPools: () => Pool[];
};

export type V3PiperxPoolRetryOptions = RetryOptions;
export type V3PiperxPoolConstruct = [Token, Token, FeeAmount];

export class V3PoolPiperxProvider
  extends PoolProvider<
    Token,
    V3PiperxPoolConstruct,
    V3ISlot0,
    V3ILiquidity,
    V3PiperxPoolAccessor
  >
  implements IV3PiperxPoolProvider
{
  // Computing pool addresses is slow as it requires hashing, encoding etc.
  // Addresses never change so can always be cached.
  private POOL_ADDRESS_CACHE: { [key: string]: string } = {};

  /**
   * Creates an instance of V4PoolProvider.
   * @param chainId The chain id to use.
   * @param multicall2Provider The multicall provider to use to get the pools.
   * @param retryOptions The retry options for each call to the multicall.
   */
  constructor(
    chainId: ChainId,
    multicall2Provider: IMulticallProvider,
    retryOptions: V3PiperxPoolRetryOptions = {
      retries: 2,
      minTimeout: 50,
      maxTimeout: 500,
    }
  ) {
    super(chainId, multicall2Provider, retryOptions);
  }

  public async getPools(
    tokenPairs: V3PiperxPoolConstruct[],
    providerConfig?: ProviderConfig
  ): Promise<V3PiperxPoolAccessor> {
    return await super.getPoolsInternal(tokenPairs, providerConfig);
  }

  public getPoolAddress(
    tokenA: Token,
    tokenB: Token,
    feeAmount: FeeAmount
  ): { poolAddress: string; token0: Token; token1: Token } {
    const { poolIdentifier, currency0, currency1 } = this.getPoolIdentifier([
      tokenA,
      tokenB,
      feeAmount,
    ]);
    return {
      poolAddress: poolIdentifier,
      token0: currency0,
      token1: currency1,
    };
  }

  protected override getLiquidityFunctionName(): string {
    return 'liquidity';
  }

  protected override getSlot0FunctionName(): string {
    return 'slot0';
  }

  protected override async getPoolsData<TReturn>(
    poolAddresses: string[],
    functionName: string,
    providerConfig?: ProviderConfig
  ): Promise<Result<TReturn>[]> {
    const { results, blockNumber } = await retry(async () => {
      return this.multicall2Provider.callSameFunctionOnMultipleContracts<
        any,
        TReturn
      >({
        addresses: poolAddresses,
        contractInterface: IUniswapV3PoolState__factory.createInterface(),
        functionName: functionName,
        providerConfig,
      });
    }, this.retryOptions);

    log.debug(`Pool data fetched as of block ${blockNumber}`);

    return results;
  }

  protected override getPoolIdentifier(pool: V3PiperxPoolConstruct): {
    poolIdentifier: string;
    currency0: Token;
    currency1: Token;
  } {
    const [tokenA, tokenB, feeAmount] = pool;

    const [token0, token1] = tokenA.sortsBefore(tokenB)
      ? [tokenA, tokenB]
      : [tokenB, tokenA];

    const cacheKey = `${this.chainId}/${token0.address}/${token1.address}/${feeAmount}`;

    const cachedAddress = this.POOL_ADDRESS_CACHE[cacheKey];

    if (cachedAddress) {
      return {
        poolIdentifier: cachedAddress,
        currency0: token0,
        currency1: token1,
      };
    }

    const poolAddress = computePoolAddress({
      factoryAddress: V3S1_CORE_FACTORY_ADDRESSES[this.chainId]!,
      tokenA: token0,
      tokenB: token1,
      fee: feeAmount,
      initCodeHashManualOverride:
        DEXES[`${this.chainId}-${Protocol.V3S1}`]?.InitCodeHash,
      chainId: this.chainId,
    });

    this.POOL_ADDRESS_CACHE[cacheKey] = poolAddress;

    return {
      poolIdentifier: poolAddress,
      currency0: token0,
      currency1: token1,
    };
  }

  protected instantiatePool(
    pool: V3PiperxPoolConstruct,
    slot0: V3ISlot0,
    liquidity: V3ILiquidity
  ): Pool {
    const [token0, token1, feeAmount] = pool;

    return new Pool(
      token0,
      token1,
      feeAmount,
      slot0.sqrtPriceX96.toString(),
      liquidity.toString(),
      slot0.tick
    );
  }

  protected instantiatePoolAccessor(poolIdentifierToPool: {
    [p: string]: Pool;
  }): V3PiperxPoolAccessor {
    return {
      getPool: (
        tokenA: Token,
        tokenB: Token,
        feeAmount: FeeAmount
      ): Pool | undefined => {
        const { poolAddress } = this.getPoolAddress(tokenA, tokenB, feeAmount);
        return poolIdentifierToPool[poolAddress];
      },
      getPoolByAddress: (address: string): Pool | undefined =>
        poolIdentifierToPool[address],
      getAllPools: (): Pool[] => Object.values(poolIdentifierToPool),
    };
  }
}
