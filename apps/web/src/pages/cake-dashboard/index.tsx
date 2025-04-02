import Page from 'components/Layout/Page'
import { CakeDashboard } from 'views/CakeDashboard'

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <Page>{children}</Page>
}

const CakeDashboardPage = () => {
  return <CakeDashboard />
}

CakeDashboardPage.Layout = Layout

export default CakeDashboardPage
