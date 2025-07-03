import { Protocol } from '@tentou-tech/uniswap-router-sdk';
import { ChainId } from '@tentou-tech/uniswap-sdk-core';

export const DEXES: Record<string, { InitCodeHash: string; DexName: string }> =
  {
    [`${ChainId.STORY}-${Protocol.V3}`]: {
      InitCodeHash:
        '0xd5178f9f07b08d01d075cc5b7e1a1ae23a37b3811522cb2fed1367201d51d4e5',
      DexName: 'Storyhunt V3',
    },
    [`${ChainId.STORY}-${Protocol.V3S1}`]: {
      InitCodeHash:
        '0xa8ffca5939bbe6e18e96df724ec3b3539269b282d1be4a535d654f640a37dcf5',
      DexName: 'PiperX V3',
    },
    [`${ChainId.STORY}-${Protocol.V2}`]: {
      InitCodeHash:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      DexName: 'PiperX V2',
    },
    [`${ChainId.HYPER_EVM}-${Protocol.V3}`]: {
      InitCodeHash:
        '0xe3572921be1688dba92df30c6781b8770499ff274d20ae9b325f4242634774fb',
      DexName: 'HyperSwap V3',
    },
  };

export const V3_FACTORY_ADDRESS: Record<string, string> = {
  [`${ChainId.STORY}-${Protocol.V3}`]:
    '0xa111ddbe973094f949d78ad755cd560f8737b7e2',
  [`${ChainId.STORY_AENEID}-${Protocol.V3}`]:
    '0xb0d76e6c7aa7a78a00af1a1083b4732a488700b4',
  [`${ChainId.STORY}-${Protocol.V3S1}`]:
    '0xb8c21e89983b5eccd841846ea294c4c8a89718f1',
  [`${ChainId.STORY_AENEID}-${Protocol.V3S1}`]:
    '0xb8c21e89983b5eccd841846ea294c4c8a89718f1',
};
