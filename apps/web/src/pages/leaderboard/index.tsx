import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import Leaderboard from 'views/Leaderboard'

const LeaderboardPage = () => {
  return <Leaderboard />
}

const Page = dynamic(() => Promise.resolve(LeaderboardPage), {
  ssr: false,
}) as NextPageWithLayout

Page.chains = []

export default Page
