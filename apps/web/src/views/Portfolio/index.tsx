import { useTranslation } from '@pancakeswap/localization'
import { Box, Card, CardBody, FlexGap, Tab, TabMenu, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import Page_ from 'components/Layout/Page'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useTheme } from '@pancakeswap/hooks'
import { formatAmount } from 'utils/formatInfoNumbers'
import { useMultichainAddressBalance } from 'hooks/useAddressBalance'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import ConnectWalletButton from 'components/ConnectWalletButton'

import { RecentTransactions } from 'components/App/Transactions/TransactionsModal'
import { AssetsList } from 'components/WalletModalV2/AssetsList'
import { CancelGiftProvider } from 'views/Gift/providers/CancelGiftProvider'
import { UnclaimedOnlyProvider } from 'views/Gift/providers/UnclaimedOnlyProvider'
import { WalletModalV2ViewStateProvider } from 'components/WalletModalV2/WalletModalV2ViewStateProvider'
import { ClaimGiftProvider } from 'views/Gift/providers/ClaimGiftProvider'
import { MenuTabProvider } from 'components/Menu/UserMenu/providers/MenuTabProvider'
import { PositionPage } from 'views/universalFarms/PositionPage'
import { PoolsBanner } from 'views/universalFarms/components'
import { TableWrapper } from 'views/Info/components/InfoTables/shared'

const Page = styled(Page_)`
  padding: 8px;

  ${({ theme }) => theme.mediaQueries.sm} {
    padding: 24px;
  }
`

const StyledBox = styled(Box)`
  background: ${({ theme }) => theme.colors.backgroundPage};
`

const TotalBalanceInteger = styled(Text)`
  font-size: 40px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

const TotalBalanceDecimal = styled(Text)`
  font-size: 40px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSubtle};
`

const WalletSection: React.FC = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { account, solanaAccount } = useAccountActiveChain()
  const { balances, isLoading, totalBalanceUsd } = useMultichainAddressBalance()

  const balanceDisplay = useMemo(() => {
    const display = formatAmount(totalBalanceUsd)?.split('.')
    return {
      integer: display?.[0] || '0',
      decimal: display?.[1] || '00',
    }
  }, [totalBalanceUsd])

  const isConnected = account || solanaAccount

  if (!isConnected) {
    return (
      <FlexGap alignItems="center" flexDirection="column" gap="16px" py="32px">
        <Text fontSize="14px" color="textSubtle" textAlign="center">
          {t('Please connect your wallet to view your wallet.')}
        </Text>
        <ConnectWalletButton />
      </FlexGap>
    )
  }

  return (
    <>
      <Card background={theme.colors.cardSecondary} mb="16px">
        <CardBody p="16px">
          <Text fontSize="20px" fontWeight="600" mb="8px">
            {t('My Wallet')}
          </Text>
          <FlexGap alignItems="center" gap="3px">
            <TotalBalanceInteger lineHeight={1.2}>${balanceDisplay.integer}</TotalBalanceInteger>
            <TotalBalanceDecimal lineHeight={1.2}>.{balanceDisplay.decimal}</TotalBalanceDecimal>
          </FlexGap>
        </CardBody>
      </Card>
      <Box mt="16px">
        <AssetsList assets={balances} isLoading={isLoading} />
      </Box>
    </>
  )
}

const WalletTransactionsSection: React.FC = () => {
  const { t } = useTranslation()
  const { account, solanaAccount } = useAccountActiveChain()
  const isConnected = account || solanaAccount

  if (!isConnected) {
    return (
      <FlexGap alignItems="center" flexDirection="column" gap="16px" py="32px">
        <Text fontSize="14px" color="textSubtle" textAlign="center">
          {t('Please connect your wallet to view transactions.')}
        </Text>
        <ConnectWalletButton />
      </FlexGap>
    )
  }

  return (
    <TableWrapper>
      <Box padding="16px">
        <RecentTransactions />
      </Box>
    </TableWrapper>
  )
}

enum PortfolioTab {
  POSITIONS = 0,
  WALLET = 1,
  TRANSACTIONS = 2,
}

export const Portfolio: React.FC = () => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()
  const [activeTab, setActiveTab] = useState<PortfolioTab>(PortfolioTab.POSITIONS)

  const handleTabClick = useCallback((index: number) => {
    setActiveTab(index)
  }, [])

  const tabsConfig = useMemo(() => {
    return [
      {
        label: t('Positions'),
        content: <PositionPage />,
      },
      {
        label: t('Wallet'),
        content: <WalletSection />,
      },
      {
        label: t('Wallet Transactions'),
        content: <WalletTransactionsSection />,
      },
    ]
  }, [t])

  return (
    <MenuTabProvider>
      <WalletModalV2ViewStateProvider>
        <ClaimGiftProvider>
          <UnclaimedOnlyProvider>
            <CancelGiftProvider>
              <StyledBox>
                <PoolsBanner />
                <Page style={isMobile ? { padding: '0 16px 16px 16px' } : undefined}>
                  <FlexGap width="100%" alignItems="flex-end" justifyContent="space-between" mb="16px">
                    <TabMenu gap="8px" activeIndex={activeTab} onItemClick={handleTabClick} isShowBorderBottom={false}>
                      {tabsConfig.map((tab) => (
                        <Tab key={tab.label}>{tab.label}</Tab>
                      ))}
                    </TabMenu>
                  </FlexGap>
                  {tabsConfig[activeTab]?.content}
                </Page>
              </StyledBox>
            </CancelGiftProvider>
          </UnclaimedOnlyProvider>
        </ClaimGiftProvider>
      </WalletModalV2ViewStateProvider>
    </MenuTabProvider>
  )
}

export default Portfolio
