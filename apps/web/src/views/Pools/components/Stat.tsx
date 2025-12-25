import { Flex, Text } from '@simpleflow/uikit'
import { Pool } from '@simpleflow/widgets-internal'

import { useTranslation } from '@simpleflow/l10n'
import { Token } from '@simpleflow/sdk'
import BigNumber from 'bignumber.js'
import Apr from './Apr'

export const AprInfo: React.FC<
  React.PropsWithChildren<{ pool: Pool.DeserializedPool<Token>; stakedBalance: BigNumber }>
> = ({ pool, stakedBalance }) => {
  const { t } = useTranslation()
  return (
    <Flex justifyContent="space-between" alignItems="center">
      <Text small>{t('APR')}:</Text>
      <Apr pool={pool} showIcon stakedBalance={stakedBalance} performanceFee={0} fontSize="14px" />
    </Flex>
  )
}
