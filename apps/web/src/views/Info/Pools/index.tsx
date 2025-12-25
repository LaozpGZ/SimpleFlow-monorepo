import { useTranslation } from '@simpleflow/l10n'
import { Heading } from '@simpleflow/uikit'
import Page from 'components/Layout/Page'
import PoolTable from 'views/Info/components/InfoTables/PoolsTable'
import { useNonSpamPoolsData } from '../hooks/usePoolsData'

const PoolsOverview: React.FC<React.PropsWithChildren> = () => {
  const { t } = useTranslation()
  const { poolsData } = useNonSpamPoolsData()

  return (
    <Page>
      <Heading scale="lg" mt="40px" mb="16px" id="info-pools-title">
        {t('All Pairs')}
      </Heading>
      <PoolTable poolDatas={poolsData} />
    </Page>
  )
}

export default PoolsOverview
