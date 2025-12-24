import { useTranslation } from '@pancakeswap/localization'
import { SubMenuItems } from '@pancakeswap/uikit'
import { useMemo } from 'react'
import { useMultiChainPath } from 'state/info/hooks'
import InfoNav from './InfoNav'

export const InfoPageLayout = ({ children }: { children?: React.ReactNode }) => {
  const chainPath = useMultiChainPath()
  const { t } = useTranslation()
  const activeItem = `/info/infinity${chainPath}`

  const subMenuItems = useMemo(() => {
    return [
      {
        label: t('V3'),
        href: `/info/v3${chainPath}`,
      },
    ]
  }, [t, chainPath])

  return (
    <>
      <SubMenuItems items={subMenuItems} activeItem={activeItem} />
      <InfoNav isStableSwap={false} />
      {children}
    </>
  )
}
