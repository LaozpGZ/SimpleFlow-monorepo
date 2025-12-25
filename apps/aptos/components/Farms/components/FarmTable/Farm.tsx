import { Flex } from '@simpleflow/uikit'
import { BIG_ZERO } from '@simpleflow/utils/bigNumber'
import { FarmWidget } from '@simpleflow/widgets-internal'
import BigNumber from 'bignumber.js'
import { PoolEarnAptTooltips } from 'components/Farms/components/FarmTable/PoolEarnAptTooltips'
import { useIsAptRewardFarm } from 'components/Farms/hooks/useIsAptRewardFarm'
import { TokenPairImage } from 'components/TokenImage'
import { useFarmUserInfoCache } from 'state/farms/hook'

const { FarmTokenInfo } = FarmWidget.FarmTable

const Farm: React.FunctionComponent<React.PropsWithChildren<FarmWidget.FarmTableFarmTokenInfoProps>> = ({
  token,
  quoteToken,
  label,
  pid,
  isReady,
  merklLink,
  lpAddress,
}) => {
  const { data: userInfo } = useFarmUserInfoCache(String(pid))
  const stakedBalance = userInfo?.amount ? new BigNumber(userInfo.amount) : BIG_ZERO
  const showPoolEarnAptTooltip = useIsAptRewardFarm(lpAddress)

  return (
    <Flex>
      <FarmTokenInfo
        pid={pid}
        label={label}
        token={token}
        quoteToken={quoteToken}
        isReady={isReady}
        isStaking={stakedBalance.gt(0)}
        merklLink={merklLink}
      >
        <TokenPairImage width={40} height={40} variant="inverted" primaryToken={token} secondaryToken={quoteToken} />
      </FarmTokenInfo>
      {showPoolEarnAptTooltip && <PoolEarnAptTooltips lpLabel={label} token={token} quoteToken={quoteToken} />}
    </Flex>
  )
}

export default Farm
