import { SUPPORTED_CHAIN_IDS } from '@pancakeswap/prediction'
import { configureStore } from '@reduxjs/toolkit'
import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import LocalReduxProvider from 'contexts/LocalRedux/Provider'
import { predictionsSlice } from 'state/predictions'
import PredictionsLeaderboard from 'views/Predictions/Leaderboard'

const formStore = configureStore({
  reducer: predictionsSlice.reducer,
})

function Leaderboard() {
  return (
    <LocalReduxProvider store={formStore}>
      <PredictionsLeaderboard />
    </LocalReduxProvider>
  )
}

const LeaderboardPage = dynamic(() => Promise.resolve(Leaderboard), {
  ssr: false,
}) as NextPageWithLayout

LeaderboardPage.chains = SUPPORTED_CHAIN_IDS
LeaderboardPage.screen = true

export default LeaderboardPage
