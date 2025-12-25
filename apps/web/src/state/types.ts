import { SerializedFarmsState } from '@simpleflow/farms'
import { SerializedPoolWithInfo } from '@simpleflow/pools'
import { CampaignType, Team, TranslatableText } from 'config/constants/types'
import { Address, parseEther } from 'viem'
import { NftToken } from './nftMarket/types'

export enum GAS_PRICE {
  default = '0.1',
  fast = '0.12',
  instant = '0.15',
  testnet = '10',
}

export const GAS_PRICE_GWEI = {
  rpcDefault: 'rpcDefault',
  default: parseEther(GAS_PRICE.default, 'gwei').toString(),
  fast: parseEther(GAS_PRICE.fast, 'gwei').toString(),
  instant: parseEther(GAS_PRICE.instant, 'gwei').toString(),
  testnet: parseEther(GAS_PRICE.testnet, 'gwei').toString(),
}

export type SerializedBigNumber = string

export enum VaultKey {
  CakeVaultV1 = 'cakeVaultV1',
  CakeVault = 'cakeVault',
  CakeFlexibleSideVault = 'cakeFlexibleSideVault',
  IfoPool = 'ifoPool',
}

export type SerializedPool = SerializedPoolWithInfo & {
  numberSecondsForUserLimit?: number
}

export interface Profile {
  userId: number
  points: number
  teamId: number
  collectionAddress: Address
  tokenId: number
  isActive: boolean
  username: string
  nft?: NftToken
  team?: Team
  hasRegistered: boolean
}

// Slices states
export interface SerializedVaultFees {
  performanceFee: number
  withdrawalFee: number
  withdrawalFeePeriod: number
}

export interface SerializedVaultUser {
  isLoading: boolean
  userShares: SerializedBigNumber
  cakeAtLastUserAction: SerializedBigNumber
  lastDepositedTime: string
  lastUserActionTime: string
}

export interface SerializedLockedVaultUser extends SerializedVaultUser {
  lockStartTime: string
  lockEndTime: string
  userBoostedShare: SerializedBigNumber
  locked: boolean
  lockedAmount: SerializedBigNumber
  currentPerformanceFee: SerializedBigNumber
  currentOverdueFee: SerializedBigNumber
}

export interface SerializedLockedCakeVault extends Omit<SerializedCakeVault, 'userData'> {
  totalLockedAmount?: SerializedBigNumber
  userData: SerializedLockedVaultUser
}

export interface SerializedCakeVault {
  totalShares?: SerializedBigNumber
  pricePerFullShare?: SerializedBigNumber
  totalCakeInVault?: SerializedBigNumber
  fees: SerializedVaultFees
  userData: SerializedVaultUser
}

// Ifo
export interface IfoState extends PublicIfoData {
  credit: string
}

export interface PublicIfoData {
  ceiling: string
}

export interface PoolsState {
  data: SerializedPool[]
  ifo: IfoState
  cakeVault: SerializedLockedCakeVault
  cakeFlexibleSideVault: SerializedCakeVault
  userDataLoaded: boolean
}

export type TeamsById = {
  [key: string]: Team
}

export interface Achievement {
  id: string
  type: CampaignType
  address: string
  title: TranslatableText
  description?: TranslatableText
  badge: string
  points: number
}

// Voting

/* eslint-disable camelcase */
/**
 * @see https://hub.snapshot.page/graphql
 */
export interface VoteWhere {
  id?: string
  id_in?: string[]
  voter?: string
  voter_in?: string[]
  proposal?: string
  proposal_in?: string[]
}

export enum ProposalType {
  ALL = 'all',
  CORE = 'core',
  COMMUNITY = 'community',
}

export enum ProposalState {
  ACTIVE = 'active',
  PENDING = 'pending',
  CLOSED = 'closed',
}

export enum ProposalTypeName {
  SINGLE_CHOICE = 'single-choice',
  WEIGHTED = 'weighted',
}

export interface Proposal {
  author: string
  body: string
  choices: string[]
  end: number
  id: string
  snapshot: string
  votes: number
  start: number
  state: ProposalState
  title: string
  ipfs: string
  type: ProposalTypeName
  scores: number[]
  scores_total: number
  space: {
    id: string
    name: string
  }
}

export interface Vote {
  id: string
  voter: string
  created: number
  proposal: {
    choices: Proposal['choices']
  }
  choice: number
  metadata?: {
    votingPower: string
  }
  vp: number
  ipfs: string
}

// Global state

export interface State {
  farms: SerializedFarmsState
  farmsV1: SerializedFarmsState
  pools: PoolsState
}
