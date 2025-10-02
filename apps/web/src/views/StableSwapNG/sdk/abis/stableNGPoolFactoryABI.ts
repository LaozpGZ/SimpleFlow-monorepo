/**
 * StableNG Pool Factory ABI
 */
export const stableNGPoolFactoryABI = [
  {
    type: 'constructor',
    inputs: [{ name: '_hookFactory', type: 'address', internalType: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createPool',
    inputs: [
      { name: '_name', type: 'string', internalType: 'string' },
      { name: '_symbol', type: 'string', internalType: 'string' },
      { name: '_coins', type: 'address[]', internalType: 'address[]' },
      { name: '_A', type: 'uint256', internalType: 'uint256' },
      { name: '_fee', type: 'uint256', internalType: 'uint256' },
      { name: '_offpegFeeMultiplier', type: 'uint256', internalType: 'uint256' },
      { name: '_maExpTime', type: 'uint256', internalType: 'uint256' },
      { name: '_implementationIdx', type: 'uint256', internalType: 'uint256' },
      { name: '_assetTypes', type: 'uint8[]', internalType: 'uint8[]' },
      { name: '_methodIds', type: 'bytes4[]', internalType: 'bytes4[]' },
      { name: '_oracles', type: 'address[]', internalType: 'address[]' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct PoolKey',
        components: [
          { name: 'currency0', type: 'address', internalType: 'Currency' },
          { name: 'currency1', type: 'address', internalType: 'Currency' },
          { name: 'hooks', type: 'address', internalType: 'contract IHooks' },
          { name: 'poolManager', type: 'address', internalType: 'contract IPoolManager' },
          { name: 'fee', type: 'uint24', internalType: 'uint24' },
          { name: 'parameters', type: 'bytes32', internalType: 'bytes32' },
        ],
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'hookFactory',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'contract ICLStableSwapHookFactory' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'poolManager',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'contract ICLPoolManager' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'PoolCreated',
    inputs: [
      { name: 'coins', type: 'address[]', indexed: false, internalType: 'address[]' },
      { name: 'A', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'fee', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'creator', type: 'address', indexed: true, internalType: 'address' },
      { name: 'poolId', type: 'bytes32', indexed: true, internalType: 'PoolId' },
    ],
    anonymous: false,
  },
  { type: 'error', name: 'NameTooLong', inputs: [] },
  { type: 'error', name: 'SymbolTooLong', inputs: [] },
] as const
