import { MINUTE_IN_SECONDS } from '@pancakeswap/utils/getTimePeriods'
import { createSelector } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js'
import orderBy from 'lodash/orderBy'
import { Address } from 'viem'
import { NodeLedger, NodeRound, PredictionsState } from '../types'
import { deserializeRound } from './helpers'

const selectCurrentEpoch = (state: PredictionsState) => state.currentEpoch
const selectRounds = (state: PredictionsState) => state.rounds
const selectLedgers = (state: PredictionsState) => state.ledgers
const selectClaimableStatuses = (state: PredictionsState) => state.claimableStatuses
const selectMinBetAmount = (state: PredictionsState) => state.minBetAmount
const selectIntervalSeconds = (state: PredictionsState) => state.intervalSeconds

export const makeGetBetByEpochSelector = (account: Address, epoch: number) =>
  createSelector([selectLedgers], (bets): null | NodeLedger => {
    if (!bets?.[account]) {
      return null
    }

    if (!bets[account][epoch]) {
      return null
    }

    return {
      amount: BigInt(bets[account][epoch].amount),
      claimed: bets[account][epoch].claimed,
      position: bets[account][epoch].position,
    }
  })

export const makeGetIsClaimableSelector = (epoch: number) =>
  createSelector([selectClaimableStatuses], (claimableStatuses) => {
    return claimableStatuses[epoch] || false
  })

export const getRoundsByCloseOracleIdSelector = createSelector([selectRounds], (rounds) => {
  return (
    rounds &&
    (Object.keys(rounds).reduce((accum, epoch) => {
      const parsed = deserializeRound(rounds[epoch])
      return {
        ...accum,
        ...(parsed.closeOracleId && {
          [parsed.closeOracleId]: parsed,
        }),
      }
    }, {}) as { [key: string]: NodeRound })
  )
})

export const getBigNumberRounds = createSelector([selectRounds], (rounds) => {
  return (
    rounds &&
    (Object.keys(rounds).reduce((accum, epoch) => {
      return {
        ...accum,
        [epoch]: deserializeRound(rounds[epoch]),
      }
    }, {}) as { [key: string]: NodeRound })
  )
})

export const getSortedRoundsSelector = createSelector([getBigNumberRounds], (rounds) => {
  return rounds && orderBy(Object.values(rounds), ['epoch'], ['asc'])
})

export const getSortedRoundsCurrentEpochSelector = createSelector(
  [selectCurrentEpoch, getSortedRoundsSelector],
  (currentEpoch, sortedRounds) => {
    return {
      currentEpoch,
      rounds: sortedRounds,
    }
  },
)

export const getMinBetAmountSelector = createSelector([selectMinBetAmount], (b) => BigInt(b))

export const getCurrentRoundCloseTimestampSelector = createSelector(
  [selectCurrentEpoch, getBigNumberRounds, selectIntervalSeconds],
  (currentEpoch, rounds, intervalSeconds) => {
    if (!currentEpoch) {
      return undefined
    }

    const currentRound = rounds?.[currentEpoch - 1]

    if (!currentRound) {
      return undefined
    }

    if (!currentRound.closeTimestamp) {
      const calculatedCloseTime = Number(currentRound.lockTimestamp) + intervalSeconds
      const now = Math.floor(Date.now() / 1000)

      // If the calculated close time is in the past, this indicates the service was paused
      if (calculatedCloseTime < now) {
        // When service resumes, provide a reasonable countdown based on the interval
        // For shorter intervals (< 5 min), give 30 seconds
        // For longer intervals, give a proportional amount but cap it at 5 minutes
        const minCountdown = 30 // minimum 30 seconds
        const maxCountdown = 300 // maximum 5 minutes
        const proportionalCountdown = Math.min(intervalSeconds * 0.1, maxCountdown) // 10% of interval, capped
        const resumeCountdownSeconds = Math.max(minCountdown, proportionalCountdown)

        return now + resumeCountdownSeconds
      }

      return calculatedCloseTime
    }
    return Number(currentRound.closeTimestamp)
  },
)

export const getIntervalTimeInMinutes = createSelector([selectIntervalSeconds], (intervalSeconds: number) => {
  return new BigNumber(intervalSeconds).div(MINUTE_IN_SECONDS).toNumber()
})
