import { useTranslation } from '@pancakeswap/localization'
import { Breadcrumbs, Link, Text } from '@pancakeswap/uikit'
import { Protocol } from '@pancakeswap/farms'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useMemo } from 'react'
import { isInfinityProtocol } from 'utils/protocols'

export type BreadcrumbNavProps = {
  protocol?: Protocol
}

// @todo @ChefJerry UI no match with design
export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ protocol }) => {
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()

  const text = useMemo(() => {
    if (!protocol) return ''
    return isInfinityProtocol(protocol) ? t('Infinity') : protocol === Protocol.V3 ? t('V3') : t('V2')
  }, [protocol, t])

  return (
    <Breadcrumbs mb="32px">
      <Link href="/liquidity/pools">
        <Text color="primary60" bold={false}>
          {t('Farms')}
        </Text>
      </Link>
      {protocol && <Link href={`/liquidity/create/${chainId}/${protocol}`}>{text}</Link>}
      <Text>{!protocol ? t('Create Liquidity Pool') : t('Create %protocol% Pool', { protocol: text })}</Text>
    </Breadcrumbs>
  )
}
