import { BigNumber } from '@ethersproject/bignumber';
import { ChainId, Token } from '@tentou-tech/uniswap-sdk-core';
import { computePoolAddress } from '@tentou-tech/uniswap-v3-sdk';
import { FeeAmount, Pool } from '@uniswap/v3-sdk';
import retry from 'async-retry';

import { IUniswapV3PoolState__factory } from '../../types/v3/factories/IUniswapV3PoolState__factory';
import { V3_CORE_FACTORY_ADDRESSES } from '../../util/addresses';
import { log } from '../../util/log';
import { IMulticallProvider, Result } from '../multicall-provider';
import { ILiquidity, ISlot0, PoolProvider } from '../pool-provider';
import { ProviderConfig } from '../provider';
import { 
  IV3PoolProvider, 
  V3PoolAccessor, 
  V3PoolConstruct,
  V3PoolRetryOptions 
} from '../v3/pool-provider';

type V3ISlot0 = ISlot0 & {
  sqrtPriceX96: BigNumber;
  tick: number;
};

type V3ILiquidity = ILiquidity;

export class V3PoolPiperxProvider
  extends PoolProvider<
    Token,
    V3PoolConstruct,
    V3ISlot0,
    V3ILiquidity,
    V3PoolAccessor
  >
  implements IV3PoolProvider
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
    retryOptions: V3PoolRetryOptions = {
      retries: 2,
      minTimeout: 50,
      maxTimeout: 500,
    }
  ) {
    super(chainId, multicall2Provider, retryOptions);
  }

  public async getPools(
    tokenPairs: V3PoolConstruct[],
    providerConfig?: ProviderConfig
  ): Promise<V3PoolAccessor> {
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

  protected override getPoolIdentifier(pool: V3PoolConstruct): {
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
      factoryAddress: V3_CORE_FACTORY_ADDRESSES[this.chainId]!,
      tokenA: token0,
      tokenB: token1,
      fee: feeAmount,
      initCodeHashManualOverride:
        '0xd5178f9f07b08d01d075cc5b7e1a1ae23a37b3811522cb2fed1367201d51d4e5',
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
    pool: V3PoolConstruct,
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
  }): V3PoolAccessor {
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
