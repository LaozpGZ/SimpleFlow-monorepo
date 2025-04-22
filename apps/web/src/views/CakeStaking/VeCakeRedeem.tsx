import { useTranslation } from '@pancakeswap/localization'
import { Box, Button, Card, ChevronDownIcon, Flex, Link, Text } from '@pancakeswap/uikit'
import BigNumber from 'bignumber.js'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Page from 'components/Layout/Page'
import { ASSET_CDN } from 'config/constants/endpoints'
import { WEEK } from 'config/constants/veCake'
import dayjs from 'dayjs'
import { createWriteContractCallback } from 'hooks/createWriteContractCallback'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useCakePrice } from 'hooks/useCakePrice'
import { useVeCakeBalance } from 'hooks/useTokenBalance'
import React, { useCallback, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useCurrentBlockTimestamp } from 'state/block/hooks'
import styled from 'styled-components'
import { getRevenueSharingCakePoolAddress, getRevenueSharingVeCakeAddress } from 'utils/addressHelpers'
import { getCakePoolContract, getRevenueSharingPoolGatewayContract, getVeCakeContract } from 'utils/contractHelpers'
import { formatTime } from 'utils/formatTime'
import { poolStartWeekCursors } from 'views/CakeStaking/config'
import { RedeemHeader } from './components/RedeemHeader'
import { DisplayUSDValue, DisplayValue, VeCakeExitField } from './components/VeCakeExitField'
import { useRevenueSharingCakePool, useRevenueSharingVeCake } from './hooks/useRevenueSharingProxy'
import { useCakeLockStatus } from './hooks/useVeCakeUserInfo'
import { useDisplayValue } from './utils/useDisplayValue'

const useCakeExitInfo = () => {
  const { balance } = useVeCakeBalance()
  const { nativeCakeLockedAmount, proxyCakeLockedAmount, cakeUnlockTime, cakeLockExpired } = useCakeLockStatus()
  const { data: veCakeShare, refetch: refetchRevenueShareVeCake } = useRevenueSharingVeCake()
  const { data: cakePoolShare, refetch: refetchRevenueShareCake } = useRevenueSharingCakePool()
  const cakePrice = useCakePrice()

  const availableClaim = BigNumber(veCakeShare.availableClaim).plus(cakePoolShare.availableClaim)

  const lockedCake = nativeCakeLockedAmount + proxyCakeLockedAmount

  const unlockTime = Number(dayjs.unix(Number(cakeUnlockTime || 0)))

  return {
    myVeCake: balance,
    lockedCake: BigNumber(lockedCake.toString()),
    availableClaim,
    availableClaimUSD: availableClaim.times(cakePrice),
    cakePoolRewards: BigNumber(cakePoolShare.availableClaim),
    veCakeRewards: BigNumber(veCakeShare.availableClaim),
    cakePrice: cakePrice.toNumber(),
    nativeCakeLockedAmount,
    proxyCakeLockedAmount,
    cakeLockExpired,
    unlockTime,
    refetchRevenueShareVeCake,
    refetchRevenueShareCake,
  }
}

const useWriteCakePoolWithdrawAllCallback = createWriteContractCallback(getCakePoolContract, 'withdrawAll')
const useClaimAll = createWriteContractCallback(getRevenueSharingPoolGatewayContract, 'claimMultiple')
const useWriteEarlyWithdrawCallback = createWriteContractCallback(getVeCakeContract, 'earlyWithdraw')
const useWriteWithdrawCallback = createWriteContractCallback(getVeCakeContract, 'withdrawAll')

export const VeCakeRedeem: React.FC = () => {
  const { t } = useTranslation()

  const { account, chainId } = useAccountActiveChain()
  const isWalletConnected = !!account
  const {
    myVeCake,
    unlockTime,
    lockedCake,
    cakePrice,
    availableClaim,
    availableClaimUSD,
    cakePoolRewards,
    veCakeRewards,
    cakeLockExpired,
    proxyCakeLockedAmount,
    nativeCakeLockedAmount,
    refetchRevenueShareVeCake,
    refetchRevenueShareCake,
  } = useCakeExitInfo()
  const userStaked = lockedCake.gt(0)
  const unlockTimeDisplay = unlockTime ? formatTime(unlockTime) : '-'

  const totalAmount = cakePoolRewards.plus(veCakeRewards).plus(lockedCake)
  const totalAmountUSD = totalAmount.times(cakePrice)
  const userHasRewards = isWalletConnected && (cakePoolRewards.gt(0) || veCakeRewards.gt(0))
  const earlyWithdraw = useWriteEarlyWithdrawCallback()
  const withdrawAll = useWriteCakePoolWithdrawAllCallback()
  const veCakeWithdrawAll = useWriteWithdrawCallback()
  const currentBlockTimestamp = useCurrentBlockTimestamp()
  const claimAll = useClaimAll()

  const proxyCakeLockedAmountDisplay = useDisplayValue(proxyCakeLockedAmount)
  const nativeCakeDisplay = useDisplayValue(nativeCakeLockedAmount)
  const cakePoolRewardDisplay = useDisplayValue(cakePoolRewards.plus(veCakeRewards))

  const handleClaim = useCallback(async () => {
    if (!account || !chainId || !currentBlockTimestamp) return

    if (userHasRewards) {
      const cakePoolAddress = getRevenueSharingCakePoolAddress(chainId)
      const cakePoolLength = Math.ceil((currentBlockTimestamp - poolStartWeekCursors[cakePoolAddress]) / WEEK / 52)
      const veCakeAddress = getRevenueSharingVeCakeAddress(chainId)
      const veCakePoolLength = Math.ceil((currentBlockTimestamp - poolStartWeekCursors[veCakeAddress]) / WEEK / 52)

      const revenueSharingPools = [
        ...Array(cakePoolLength).fill(cakePoolAddress),
        ...Array(veCakePoolLength).fill(veCakeAddress),
      ]
      const uniq = [...new Set(revenueSharingPools)]

      await claimAll.callMethod(uniq, account)
      refetchRevenueShareCake()
      refetchRevenueShareVeCake()
    }
  }, [account, chainId, currentBlockTimestamp, claimAll, userHasRewards])

  const handleVeCake = useCallback(async () => {
    console.log(`[cake], veCake`)
    if (!account || !chainId || !currentBlockTimestamp) return

    if (userStaked) {
      if (cakeLockExpired) {
        await veCakeWithdrawAll.callMethod(account)
      } else {
        await earlyWithdraw.callMethod(account, BigInt(nativeCakeLockedAmount))
      }
    }
  }, [
    earlyWithdraw,
    userStaked,
    account,
    chainId,
    currentBlockTimestamp,
    cakeLockExpired,
    lockedCake,
    veCakeWithdrawAll,
    nativeCakeLockedAmount,
  ])

  const handleCakePool = useCallback(async () => {
    console.log(`[cake], cakePool`)
    if (!account || !chainId || !currentBlockTimestamp) return
    if (proxyCakeLockedAmount > 0) {
      await withdrawAll.callMethod()
    }
  }, [proxyCakeLockedAmount, account, chainId, currentBlockTimestamp, withdrawAll])
  const [expand, setExpand] = useState(false)

  const buttons = [
    {
      key: 'cakepool',
      textEnabled: `${t('Redeem From Cake Pool')}(${proxyCakeLockedAmountDisplay}) CAKE`,
      textDisable: `${t('Redeem From Cake Pool')} ${t('Finished')}`,
      handler: handleCakePool,
      enabled: proxyCakeLockedAmount > 0,
    },
    {
      key: 'vecake',
      textEnabled: `${t('Redeem from veCAKE')}(${nativeCakeDisplay}) CAKE`,
      textDisable: `${t('Redeem from veCAKE')} ${t('Finished')}`,
      handler: handleVeCake,
      enabled: nativeCakeLockedAmount > 0,
    },
    {
      key: 'claimall',
      textEnabled: `${t('Claim All Rewards')}(${cakePoolRewardDisplay}) CAKE`,
      textDisable: `${t('Redeem from veCAKE')} ${t('Finished')}`,
      handler: handleClaim,
      enabled: userHasRewards,
    },
  ]

  const [processing, setProcessing] = useState(false)
  const handleProcessAll = async () => {
    if (buttons.every((button) => !button.enabled)) return
    setProcessing(true)

    try {
      for (const button of buttons) {
        // eslint-disable-next-line
        await button.handler()
      }
    } catch (ex) {
      console.warn(ex)
    } finally {
      setProcessing(false)
    }
  }

  const allSettled = buttons.every((button) => !button.enabled)

  return (
    <Bg>
      <Page title={t('Redeem Staked Cake')}>
        <Container>
          <RedeemHeader />
          <StyledCard isActive>
            <div
              style={{
                padding: '24px',
              }}
            >
              <SectionTitle isMobile={isMobile}>{t('MY CAKE STAKING POSITION')}</SectionTitle>

              <FieldGroup>
                <VeCakeExitField
                  label="My veCAKE"
                  value={myVeCake}
                  valueTooltip={
                    <>
                      {t(
                        'veCAKE is calculated with number of CAKE locked, and the remaining time against maximum lock time.',
                      )}

                      <LearnMore />
                    </>
                  }
                />

                <VeCakeExitField
                  label="My Locked CAKE"
                  value={lockedCake}
                  symbol="CAKE"
                  valueStyles={{
                    fontWeight: 600,
                    fontSize: '16px',
                    lineHeight: '120%',
                    textAlign: 'right',
                  }}
                  usdValue={!allSettled ? lockedCake.times(cakePrice) : undefined}
                  labelTooltip={t(
                    'All locked CAKE has been unlocked since April 23, 2025, at 08:00 AM UTC and is available for claiming.',
                  )}
                />

                {Boolean(nativeCakeLockedAmount > 0 && unlockTime > 0) && (
                  <VeCakeExitField
                    label="Unlock Date"
                    value={
                      <>
                        {unlockTime < Date.now() && <Text>{t('Unlocked on')} </Text>}
                        <DateText
                          style={{
                            textDecoration: unlockTime > Date.now() ? 'line-through' : 'none',
                            fontSize: '16px',
                          }}
                        >
                          {unlockTimeDisplay}
                        </DateText>
                        {unlockTime > Date.now() && <Text>{t('Anytime')}</Text>}
                      </>
                    }
                  />
                )}

                <VeCakeExitField
                  label={t('My Total rewards')}
                  value={
                    <Flex
                      onClick={() => {
                        setExpand(!expand)
                      }}
                      style={{
                        cursor: 'pointer',
                      }}
                    >
                      {!allSettled && availableClaim.gt(0) && (
                        <DisplayValue
                          value={availableClaim}
                          symbol="CAKE"
                          style={{
                            fontSize: '16px',
                            fontWeight: 600,
                          }}
                        />
                      )}
                      {!allSettled && availableClaim.gt(0) && <ChevronDownIcon color="primary60" />}
                    </Flex>
                  }
                  symbol="CAKE"
                  usdValue={availableClaimUSD}
                />

                {!allSettled && expand && (
                  <>
                    <SubField>
                      <VeCakeExitField label={t('CAKE Pool Rewards')} value={cakePoolRewards} symbol="CAKE" />
                      <VeCakeExitField label={t('Revenue Sharing Rewards')} value={veCakeRewards} symbol="CAKE" />
                    </SubField>
                  </>
                )}
              </FieldGroup>

              {!allSettled && (
                <TotalRedeemBox>
                  <Box>
                    <RedeemIcon src={`${ASSET_CDN}/web/vecake/redeem-icon.png`} alt="redeem" />
                  </Box>
                  <Flex flex={1} flexDirection="row" justifyContent="space-between">
                    <Box>
                      <RedeemTitle>{t('REDEEM NOW')}</RedeemTitle>
                      <RedeemLabel>{t('Total amount')}</RedeemLabel>
                      {/* <VeCakeExitField label="Total amount" value={totalAmount} symbol="CAKE" usdValue={totalAmountUSD} /> */}
                    </Box>
                    <Box>
                      <StyledRedeemValue symbol="CAKE" value={totalAmount} />
                      <DisplayUSDValue value={totalAmountUSD} />
                    </Box>
                  </Flex>
                </TotalRedeemBox>
              )}

              {!isWalletConnected && (
                <ConnectWalletButton
                  style={{
                    width: '100%',
                  }}
                />
              )}
              {isWalletConnected && !allSettled && (
                <>
                  <StyledButton onClick={handleProcessAll} fullWidth disabled={processing}>
                    {t('Redeem & Claim')}
                  </StyledButton>
                </>
              )}
            </div>
          </StyledCard>
        </Container>
      </Page>
    </Bg>
  )
}

const RedeemLabel = styled(Text)`
  font-family: Kanit;
  font-weight: 400;
  font-size: 14px;
  line-height: 120%;
  letter-spacing: 0px;
  vertical-align: middle;
  color: ${({ theme }) => theme.colors.textSubtle};
`

const StyledRedeemValue = styled(DisplayValue)`
  font-family: Kanit;
  font-weight: 600;
  font-size: 16px;
  line-height: 120%;
  letter-spacing: 0px;
  text-align: right;
  color: ${({ theme }) => theme.colors.secondary};
`

const RedeemIcon = styled.img`
  width: 46px;
  height: 55px;
  margin-right: 8px;
`

const TotalRedeemBox = styled(Box)`
  margin-bottom: 16px;
  margin-top: 8px;
  background: ${({ theme }) => theme.colors.gradientBubblegum};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px;
  padding-top: 8px;
  padding-right: 16px;
  padding-bottom: 8px;
  padding-left: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const DateText = styled(Text)`
  text-decoration: line-through;
  fontsize: 16px;
  color: ${({ theme }) => theme.colors.textDisabled};
`

const Bg = styled.div`
  background: ${({ theme }) => theme.colors.gradientBubblegum};
  min-height: 100vh;
`
const Container = styled.div`
  margin: 0 auto;
  max-width: 1200px;
`

// Styled Components
const StyledCard = styled(Card)`
  max-width: 550px;
  margin: 0 auto;
  border-radius: 24px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  box-shadow: 0px 2px 0px 0px ${({ theme }) => theme.colors.inputSecondary};
`

const SectionTitle = styled(Text)<{ isMobile: boolean }>`
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 16px;
  font-family: Kanit;
  font-weight: 600;
  font-size: 12px;
  line-height: 120%;
  letter-spacing: 3%;
  text-transform: uppercase;
`

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
`

const SubField = styled.div`
  padding: 16px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

const RedeemTitle = styled(Text)`
  color: ${({ theme }) => theme.colors.secondary};
  font-family: Kanit;
  font-weight: 600;
  font-size: 12px;
  line-height: 120%;
  letter-spacing: 3%;
  text-transform: uppercase;
`

const StyledButton = styled(Button)`
  font-weight: 600;
  width: 100%;
`

const LearnMore: React.FC<{ href?: string }> = ({
  href = 'https://docs.pancakeswap.finance/products/vecake/migrate-from-cake-pool#10ffc408-be58-4fa8-af56-be9f74d03f42',
}) => {
  const { t } = useTranslation()
  return (
    <Link href={href} color="text" external>
      {t('Learn More >>')}
    </Link>
  )
}
