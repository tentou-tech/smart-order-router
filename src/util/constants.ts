export const DEXES = {
  StoryHunt: {
    InitCodeHash:
      '0xd5178f9f07b08d01d075cc5b7e1a1ae23a37b3811522cb2fed1367201d51d4e5',
  },
};


export const DEX_SUPPORTED = [
  {
    name: 'StoryHunt',
    initCodeHash:
      '0xd5178f9f07b08d01d075cc5b7e1a1ae23a37b3811522cb2fed1367201d51d4e5',
  },
  {
    name: 'PiPerx-V3',
    initCodeHash:
      '0xa8ffca5939bbe6e18e96df724ec3b3539269b282d1be4a535d654f640a37dcf5',
  },
];

// TODO: workaround for add dex. Build mapping for factory address with chainId and initCodeHash
export const V3_CORE_FACTORY_ADDRESSES_MAP: Record<string, string> = {
  // map for testnet
  '1315-0xd5178f9f07b08d01d075cc5b7e1a1ae23a37b3811522cb2fed1367201d51d4e5': '0x3D9300D311BA04EB3351663676cEE0748473d9A0',
  '1315-0xa8ffca5939bbe6e18e96df724ec3b3539269b282d1be4a535d654f640a37dcf5': '0xb8c21e89983B5EcCD841846eA294c4c8a89718f1',
};
