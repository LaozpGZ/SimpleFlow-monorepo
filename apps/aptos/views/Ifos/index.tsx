import { useMemo } from 'react'
import { SubMenuItems } from '@simpleflow/uikit'
import { useTranslation } from '@simpleflow/l10n'
import { PageMeta } from 'components/Layout/Page'
import { useRouter } from 'next/router'
import Hero from './components/Hero'
import IfoProvider from './contexts/IfoContext'

export const IfoPageLayout = ({ children }) => {
  const { t } = useTranslation()
  const router = useRouter()
  const isExact = router.route === '/ifo'

  const subMenuItems = useMemo(
    () => [
      {
        label: t('Latest'),
        href: '/ifo',
      },
      {
        label: t('Finished'),
        href: '/ifo/history',
      },
    ],
    [t],
  )

  return (
    <IfoProvider>
      <PageMeta title={t('Initial Farm Offering')} />
      <SubMenuItems items={subMenuItems} activeItem={isExact ? '/ifo' : '/ifo/history'} />
      <Hero />
      {children}
    </IfoProvider>
  )
}
