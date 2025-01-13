import { ChainId } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { Box, Button, Card, CardBody, CardHeader, FlexGap, Text } from '@pancakeswap/uikit'
import getTimePeriods from '@pancakeswap/utils/getTimePeriods'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { styled } from 'styled-components'
import { useAccount } from 'wagmi'
import { IdoRibbon } from './IdoRibbon'

import { getBannerUrl } from '../../helpers'
import { IDOPublicData } from '../../hooks/ido/useIdoPublicData'

export const StyledCardBody = styled(CardBody)`
  padding: 24px 16px;
  ${({ theme }) => theme.mediaQueries.md} {
    padding: 24px;
  }
`

const Header = styled(CardHeader)<{ ifoId: string; $isCurrent?: boolean }>`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: ${({ $isCurrent }) => ($isCurrent ? '64px' : '112px')};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  background-color: ${({ theme }) => theme.colors.dropdown};
  background-image: ${({ ifoId }) => `url('${getBannerUrl(ifoId)}')`};
  ${({ theme }) => theme.mediaQueries.md} {
    height: 112px;
  }
`

export const IDoCurrentCard = ({
  idoPublicData,
  chainId,
  idoId,
}: {
  idoPublicData: IDOPublicData
  chainId: ChainId
  idoId: string
}) => {
  return (
    <Card style={{ width: '100%' }}>
      <Box className="sticky-header" position="sticky" bottom="48px" width="100%" zIndex={6}>
        <Header $isCurrent ifoId={idoId} />
        <IdoRibbon
          ifoId={idoId}
          startTime={idoPublicData.startTime}
          plannedStartTime={idoPublicData.plannedStartTime}
          timeProgress={idoPublicData.timeProgress}
          ifoStatus={idoPublicData.status}
          ifoChainId={chainId}
          endTime={idoPublicData.endTime}
        />
        <IdoCard idoPublicData={idoPublicData} />
      </Box>
    </Card>
  )
}

export const IdoCard: React.FC<{ idoPublicData: IDOPublicData }> = ({ idoPublicData }) => {
  return (
    <CardBody>
      <IdoSaleInfoCard idoPublicData={idoPublicData} />
      <IdoStakeActionCard idoPublicData={idoPublicData} />
    </CardBody>
  )
}

export const IdoSaleInfoCard: React.FC<{ idoPublicData: IDOPublicData }> = ({ idoPublicData }) => {
  const { t } = useTranslation()
  return (
    <Card background="#FAF9FA" mb="16px">
      <CardBody>
        <FlexGap gap="8px">
          {/* @ts-ignore */}
          <CurrencyLogo size="40px" currency={idoPublicData?.offeringCurrency} />
          <FlexGap flexDirection="column">
            <Text fontSize="12px" bold color="secondary" lineHeight="18px">
              {t('Total Sale')}
            </Text>
            <Text bold fontSize="20px" lineHeight="30px">
              {idoPublicData.saleAmount?.toSignificant(6)}
              {idoPublicData.offeringCurrency?.symbol}
            </Text>
          </FlexGap>
        </FlexGap>
        <FlexGap flexDirection="column" gap="8px">
          <FlexGap justifyContent="space-between">
            <Text color="textSubtle">{t('Project Duration')}</Text>
            <Text>
              {getTimePeriods(idoPublicData.duration).days} {t('days')}
            </Text>
          </FlexGap>
        </FlexGap>
        <Text color="textSubtle" mt="16px">
          {t('You can subscribe to the sale by depositing BNB and CAKE half in ratio.')}
        </Text>
      </CardBody>
    </Card>
  )
}

export const IdoStakeActionCard: React.FC<{ idoPublicData: IDOPublicData }> = ({ idoPublicData }) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  return (
    <Card background="#FAF9FA">
      <CardBody>
        <FlexGap flexDirection="column" gap="8px">
          <FlexGap flexDirection="column">
            <Text fontSize="12px" bold color="secondary" lineHeight="18px">
              {idoPublicData.stakeCurrency?.symbol} {t('Pool')}
            </Text>
            <FlexGap gap="8px">
              {/* @ts-ignore */}
              <CurrencyLogo size="40px" currency={idoPublicData?.offeringCurrency} />
              {account ? <IdoDepositButton idoPublicData={idoPublicData} /> : <ConnectWalletButton width="100%" />}
            </FlexGap>
          </FlexGap>
          <FlexGap justifyContent="space-between">
            <Text color="textSubtle">{t('Sale Price per TOKEN')}</Text>
            <Text>
              {idoPublicData.pricePerToken?.toSignificant(6)} {idoPublicData.stakeCurrency?.symbol ?? ''}
            </Text>
          </FlexGap>
          <FlexGap justifyContent="space-between">
            <Text color="textSubtle">{t('Target Raise')}</Text>
            <Text>
              {idoPublicData.raiseAmount?.toSignificant(6)} {idoPublicData.stakeCurrency?.symbol ?? ''}
            </Text>
          </FlexGap>
          {idoPublicData.status === 'live' && (
            <>
              <FlexGap justifyContent="space-between">
                <Text color="textSubtle">{t('Total committed')}</Text>
                <Text>
                  {idoPublicData?.currentStakedAmount?.toSignificant(6)} {idoPublicData.stakeCurrency?.symbol ?? ''}
                </Text>
              </FlexGap>
              <FlexGap justifyContent="space-between">
                <Text color="textSubtle">{t('Status')}</Text>
                <Text>{idoPublicData.progress.toFixed(2)} %</Text>
              </FlexGap>
            </>
          )}
        </FlexGap>
      </CardBody>
    </Card>
  )
}

export const IdoDepositButton: React.FC<{ idoPublicData: IDOPublicData }> = ({ idoPublicData }) => {
  const { t } = useTranslation()
  return (
    <>
      <Button width="100%">
        {t('Deposit')} {idoPublicData?.stakeCurrency?.symbol ?? ''}
      </Button>
    </>
  )
}
