// SimpleChain Liquid Staking ABI - sSRW (Staked SRW)
// 基于 snBNB 合约的简化版本
export const sSrwABI = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: '_src', type: 'address' },
      { indexed: false, internalType: 'uint256', name: '_amount', type: 'uint256' },
    ],
    name: 'Deposit',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: '_account', type: 'address' },
      { indexed: false, internalType: 'uint256', name: '_amountInSSrw', type: 'uint256' },
    ],
    name: 'RequestWithdraw',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: '_account', type: 'address' },
      { indexed: false, internalType: 'uint256', name: '_idx', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: '_amount', type: 'uint256' },
    ],
    name: 'ClaimWithdrawal',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'address', name: 'account', type: 'address' }],
    name: 'Paused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'address', name: 'account', type: 'address' }],
    name: 'Unpaused',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' }],
    name: 'convertSrwToSSrw',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_amountInSSrw', type: 'uint256' }],
    name: 'convertSSrwToSrw',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalPooledSrw',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getSSrwWithdrawLimit',
    outputs: [{ internalType: 'uint256', name: '_sSrwWithdrawLimit', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_user', type: 'address' },
      { internalType: 'uint256', name: '_idx', type: 'uint256' },
    ],
    name: 'getUserRequestStatus',
    outputs: [
      { internalType: 'bool', name: '_isClaimable', type: 'bool' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_address', type: 'address' }],
    name: 'getUserWithdrawalRequests',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'uuid', type: 'uint256' },
          { internalType: 'uint256', name: 'amountInSSrw', type: 'uint256' },
          { internalType: 'uint256', name: 'startTime', type: 'uint256' },
        ],
        internalType: 'struct IStakeManager.WithdrawalRequest[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_amountInSSrw', type: 'uint256' }],
    name: 'requestWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_idx', type: 'uint256' }],
    name: 'claimWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalDelegated',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
] as const
