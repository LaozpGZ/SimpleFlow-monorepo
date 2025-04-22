import Page from 'components/Layout/Page'
import { NextSeo } from 'next-seo'
import { BurnDashboard } from 'views/BurnDashboard'

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      <NextSeo title="Burn Dashboard" />
      <Page>{children}</Page>
    </>
  )
}

const BurnDashboardPage = () => {
  return <BurnDashboard />
}

BurnDashboardPage.Layout = Layout
BurnDashboardPage.chains = []

export default BurnDashboardPage
