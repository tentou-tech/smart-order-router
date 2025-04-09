// /* eslint-disable @typescript-eslint/no-unused-vars */
// import { JsonRpcProvider } from '@ethersproject/providers';
// import {
//   ChainId,
//   Currency,
//   Token,
//   TradeType,
// } from '@tentou-tech/uniswap-sdk-core';
// import { Protocol } from '@uniswap/router-sdk';
// import 'jest-environment-hardhat';
// import NodeCache from 'node-cache';

// import {
//   CachingV3PoolProvider,
//   CachingV4PoolProvider,
//   EthEstimateGasSimulator,
//   FallbackTenderlySimulator,
//   NodeJSCache,
//   TenderlySimulator,
//   TokenPropertiesProvider,
//   UniswapMulticallProvider,
//   V2PoolProvider,
//   V3PoolProvider,
//   V4PoolProvider,
// } from './providers';
// import { PortionProvider } from './providers/portion-provider';
// import { OnChainTokenFeeFetcher } from './providers/token-fee-fetcher';
// import { AlphaRouter, AlphaRouterConfig } from './routers';
// import { DEFAULT_ROUTING_CONFIG_BY_CHAIN } from './routers/alpha-router/config';
// import { ID_TO_CHAIN_ID, ID_TO_PROVIDER, parseAmount } from './util';

// /**
//  * @jest-environment hardhat
//  */

export * from './providers';
export * from './routers';
export * from './util';

// async function test() {
//   const tokenIn = new Token(
//     ChainId.STORY_AENEID,
//     '0x1514000000000000000000000000000000000000',
//     18,
//     'WIP',
//     'Wrapped IP'
//   );
//   const tokenOut = new Token(
//     ChainId.STORY_AENEID,
//     '0x5D2Bbf372A716878dc29087C13f7950c4Ce3D973',
//     18,
//     'JUTSU20',
//     'ERC20 JUTSU'
//   );
//   const amount = parseAmount('1000000', tokenIn);
//   const getQuoteToken = (
//     tokenIn: Currency,
//     tokenOut: Currency,
//     tradeType: TradeType
//   ): Currency => {
//     return tradeType == TradeType.EXACT_INPUT ? tokenOut : tokenIn;
//   };
//   const ROUTING_CONFIG: AlphaRouterConfig = {
//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-ignore[TS7053] - complaining about switch being non exhaustive
//     ...DEFAULT_ROUTING_CONFIG_BY_CHAIN[ChainId.STORY_AENEID],
//     protocols: [Protocol.V3],
//     saveTenderlySimulationIfFailed: false, // save tenderly simulation on integ-test runs, easier for debugging
//   };
//   const chainId = ID_TO_CHAIN_ID(1315);
//   const chainProvider = ID_TO_PROVIDER(1315);

//   const provider = new JsonRpcProvider(chainProvider, chainId);
//   const tokenFeeFetcher = new OnChainTokenFeeFetcher(
//     ChainId.STORY_AENEID,
//     provider
//   );
//   const tokenPropertiesProvider = new TokenPropertiesProvider(
//     ChainId.STORY_AENEID,
//     new NodeJSCache(new NodeCache({ stdTTL: 360, useClones: false })),
//     tokenFeeFetcher
//   );
//   const multicall2Provider = new UniswapMulticallProvider(
//     ChainId.STORY_AENEID,
//     provider
//   );
//   const v2PoolProvider = new V2PoolProvider(
//     ChainId.STORY_AENEID,
//     multicall2Provider,
//     tokenPropertiesProvider
//   );
//   const v3PoolProvider = new CachingV3PoolProvider(
//     ChainId.STORY_AENEID,
//     new V3PoolProvider(ChainId.STORY_AENEID, multicall2Provider),
//     new NodeJSCache(new NodeCache({ stdTTL: 360, useClones: false }))
//   );
//   const v4PoolProvider = new CachingV4PoolProvider(
//     ChainId.STORY_AENEID,
//     new V4PoolProvider(ChainId.STORY_AENEID, multicall2Provider),
//     new NodeJSCache(new NodeCache({ stdTTL: 360, useClones: false }))
//   );
//   const portionProvider = new PortionProvider();
//   const tenderlySimulator = new TenderlySimulator(
//     ChainId.STORY_AENEID,
//     process.env.TENDERLY_BASE_URL!,
//     process.env.TENDERLY_USER!,
//     process.env.TENDERLY_PROJECT!,
//     process.env.TENDERLY_ACCESS_KEY!,
//     process.env.TENDERLY_NODE_API_KEY!,
//     v2PoolProvider,
//     v3PoolProvider,
//     v4PoolProvider,
//     provider,
//     portionProvider,
//     {
//       // Tenderly team has fixed all the nuances post Arbitrum nitro update,
//       // so we can use the gas limits returned from Tenderly for more accurate L2 gas estimate assertions.
//       [ChainId.ARBITRUM_ONE]: 1,
//     },
//     // we will start using the new tenderly node endpoint in SOR integ-test suite at 100%
//     3000,
//     100,
//     [
//       ChainId.STORY_AENEID,
//       ChainId.BASE,
//       ChainId.ARBITRUM_ONE,
//       ChainId.OPTIMISM,
//       ChainId.POLYGON,
//       ChainId.AVALANCHE,
//       ChainId.BLAST,
//       ChainId.WORLDCHAIN,
//     ]
//   );
//   const ethEstimateGasSimulator = new EthEstimateGasSimulator(
//     ChainId.STORY_AENEID,
//     provider,
//     v2PoolProvider,
//     v3PoolProvider,
//     v4PoolProvider,
//     portionProvider
//   );
//   const simulator = new FallbackTenderlySimulator(
//     ChainId.STORY_AENEID,
//     provider,
//     new PortionProvider(),
//     tenderlySimulator,
//     ethEstimateGasSimulator
//   );
//   const alphaRouter: AlphaRouter = new AlphaRouter({
//     chainId: ChainId.STORY_AENEID,
//     provider: provider,
//     multicall2Provider,
//     v2PoolProvider,
//     v3PoolProvider,
//     v4PoolProvider,
//     simulator,
//   });

//   const swap = await alphaRouter.route(
//     amount,
//     getQuoteToken(tokenIn, tokenOut, TradeType.EXACT_INPUT),
//     TradeType.EXACT_INPUT,
//     undefined,
//     {
//       ...ROUTING_CONFIG,
//     }
//   );
//   console.log(swap);
// }

// test();
