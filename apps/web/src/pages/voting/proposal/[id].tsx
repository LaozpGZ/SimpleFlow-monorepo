import dynamic from 'next/dynamic'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { NextPageWithLayout } from 'utils/page.types'
import { getProposal } from 'state/voting/helpers'
import Overview from 'views/Voting/Proposal/Overview'

const ProposalView = () => {
  return <Overview />
}

const Page = dynamic(() => Promise.resolve(ProposalView), { ssr: false }) as NextPageWithLayout

export default Page
