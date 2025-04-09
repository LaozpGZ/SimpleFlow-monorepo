import Page from 'components/Layout/Page'
import { NextSeo } from 'next-seo'
import { CakeDashboard } from 'views/CakeDashboard'

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      <NextSeo title="Burn Dashboard" />
      <Page>{children}</Page>
    </>
  )
}

const CakeDashboardPage = () => {
  return <CakeDashboard />
}

CakeDashboardPage.Layout = Layout

export default CakeDashboardPage
