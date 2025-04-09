import { ChainId, Token } from '@tentou-tech/uniswap-sdk-core';
import { Protocol } from '@uniswap/router-sdk';

import { ProviderConfig } from '../provider';
import { SubgraphProvider } from '../subgraph-provider';

export interface V3SubgraphPool {
  id: string;
  feeTier: string;
  liquidity: string;
  token0: {
    id: string;
  };
  token1: {
    id: string;
  };
  tvlETH: number;
  tvlUSD: number;

  initCodeHashManualOverride?: string;
  factoryAddressManualOverride?: string;
}

export type V3RawSubgraphPool = {
  id: string;
  feeTier: string;
  liquidity: string;
  token0: {
    symbol: string;
    id: string;
  };
  token1: {
    symbol: string;
    id: string;
  };
  totalValueLockedUSD: string;
  totalValueLockedETH: string;
  totalValueLockedUSDUntracked: string;
};

export const STORY_UNISWAP_V3: {
  [chainId in ChainId]?: {
    initCodeHash: string;
    factoryAddress: string;
    dex: string;
  }[];
} = {
  [ChainId.STORY_AENEID]: [
    {
      dex: 'piperx',
      initCodeHash:
        '0xa8ffca5939bbe6e18e96df724ec3b3539269b282d1be4a535d654f640a37dcf5',
      factoryAddress: '0xb8c21e89983B5EcCD841846eA294c4c8a89718f1',
    },
    {
      dex: 'storyhunt',
      initCodeHash:
        '0xd5178f9f07b08d01d075cc5b7e1a1ae23a37b3811522cb2fed1367201d51d4e5',
      factoryAddress: '0x475c188B4e95612Aa2b1e327f2EA9639719151Ac',
    },
  ],
  [ChainId.STORY]: [
    {
      dex: 'piperx',
      initCodeHash:
        '0xa8ffca5939bbe6e18e96df724ec3b3539269b282d1be4a535d654f640a37dcf5',
      factoryAddress: '0xb8c21e89983B5EcCD841846eA294c4c8a89718f1',
    },
    {
      dex: 'storyhunt',
      initCodeHash:
        '0xd5178f9f07b08d01d075cc5b7e1a1ae23a37b3811522cb2fed1367201d51d4e5',
      factoryAddress: '0x74014BbbE2702274c01acA0BD0c5389779f5A050',
    },
  ],
};

const SUBGRAPH_URL_BY_CHAIN: { [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]:
    'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
  [ChainId.OPTIMISM]:
    'https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis',
  // todo: add once subgraph is live
  [ChainId.OPTIMISM_SEPOLIA]: '',
  [ChainId.ARBITRUM_ONE]:
    'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-minimal',
  // todo: add once subgraph is live
  [ChainId.ARBITRUM_SEPOLIA]: '',
  [ChainId.POLYGON]:
    'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon',
  [ChainId.CELO]:
    'https://api.thegraph.com/subgraphs/name/jesse-sawa/uniswap-celo',
  [ChainId.GOERLI]:
    'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-gorli',
  [ChainId.BNB]:
    'https://api.thegraph.com/subgraphs/name/ilyamk/uniswap-v3---bnb-chain',
  [ChainId.AVALANCHE]:
    'https://api.thegraph.com/subgraphs/name/lynnshaoyu/uniswap-v3-avax',
  [ChainId.BASE]:
    'https://api.studio.thegraph.com/query/48211/uniswap-v3-base/version/latest',
  [ChainId.BLAST]:
    'https://gateway-arbitrum.network.thegraph.com/api/0ae45f0bf40ae2e73119b44ccd755967/subgraphs/id/2LHovKznvo8YmKC9ZprPjsYAZDCc4K5q4AYz8s3cnQn1',
  [ChainId.STORY_AENEID]:
    'https://graph-api-testnet.tentou.tech/subgraphs/name/mimboku/',
};

/**
 * Provider for getting V3 pools from the Subgraph
 *
 * @export
 * @interface IV3SubgraphProvider
 */
export interface IV3SubgraphProvider {
  getPools(
    tokenIn?: Token,
    tokenOut?: Token,
    providerConfig?: ProviderConfig,
    chainId?: ChainId
  ): Promise<V3SubgraphPool[]>;
}

export class V3SubgraphProvider
  extends SubgraphProvider<V3RawSubgraphPool, V3SubgraphPool>
  implements IV3SubgraphProvider
{
  constructor(
    chainId: ChainId,
    retries = 2,
    timeout = 30000,
    rollback = true,
    trackedEthThreshold = 0.01,
    untrackedUsdThreshold = Number.MAX_VALUE,
    subgraphUrlOverride?: string
  ) {
    super(
      Protocol.V3,
      chainId,
      retries,
      timeout,
      rollback,
      trackedEthThreshold,
      untrackedUsdThreshold,
      subgraphUrlOverride ?? SUBGRAPH_URL_BY_CHAIN[chainId]
    );
  }

  protected override subgraphQuery(blockNumber?: number): string {
    return `
    query getPools($pageSize: Int!, $id: String) {
      pools(
        first: $pageSize
        ${blockNumber ? `block: { number: ${blockNumber} }` : ``}
          where: { id_gt: $id }
        ) {
          id
          token0 {
            symbol
            id
          }
          token1 {
            symbol
            id
          }
          feeTier
          liquidity
          totalValueLockedUSD
          totalValueLockedETH
          totalValueLockedUSDUntracked
        }
      }
   `;
  }

  protected override mapSubgraphPool(
    rawPool: V3RawSubgraphPool
  ): V3SubgraphPool {
    return {
      id: rawPool.id,
      feeTier: rawPool.feeTier,
      liquidity: rawPool.liquidity,
      token0: {
        id: rawPool.token0.id,
      },
      token1: {
        id: rawPool.token1.id,
      },
      tvlETH: parseFloat(rawPool.totalValueLockedETH),
      tvlUSD: parseFloat(rawPool.totalValueLockedUSD),
    };
  }
}
