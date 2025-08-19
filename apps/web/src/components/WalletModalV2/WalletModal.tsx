import { useTranslation } from '@pancakeswap/localization'
import {
  ArrowBackIcon,
  ArrowForwardIcon,
  Box,
  Button,
  FlexGap,
  Modal,
  ModalHeader,
  ModalV2,
  Text,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'

import { RecentTransactions } from 'components/App/Transactions/TransactionsModal'

import { useTheme } from '@pancakeswap/hooks'
import { useMenuTab, WalletView } from 'components/Menu/UserMenu/providers/MenuTabProvider'
import { TabsComponent } from 'components/Menu/UserMenu/WalletModal'
import { useAddressBalance } from 'hooks/useAddressBalance'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { formatAmount } from 'utils/formatInfoNumbers'
import { ClaimGiftConfirmView } from 'views/Gift/components/ClaimGiftConfirmView'
import { ClaimGiftView } from 'views/Gift/components/ClaimGiftView'
import { GiftInfoDetailView } from 'views/Gift/components/GiftInfoDetailView'
import { GiftsDashboard } from 'views/Gift/components/GiftsDashboard'
import { NonEVMChainId } from '@pancakeswap/chains'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useAccountActiveChain } from 'hooks/useAccountActiveChain'
import { CancelGiftProvider } from 'views/Gift/providers/CancelGiftProvider'
import { useConnect } from 'wagmi'
import { useWallet } from '@solana/wallet-adapter-react'
import { previouslyUsedWalletsAtom } from '@pancakeswap/ui-wallets'
import { walletsConfig } from 'config/wallet'
import { useAtom } from 'jotai'
import { ActionButton } from './ActionButton'
import { AssetsList } from './AssetsList'
import { SendAssets } from './SendAssets'
import { SEND_ENTRY, ViewState } from './type'
import { CopyAddress } from './WalletCopyButton'
import { useWalletModalV2ViewState } from './WalletModalV2ViewStateProvider'
import ReceiveOptionsView from './ReceiveOptionsView'
import { ReceiveContent } from './ReceiveModal'
import EmptyWalletActions from './EmptyWalletActions'

interface WalletModalProps {
  isOpen: boolean
  account?: string
  onDismiss: () => void
  onReceiveClick: () => void
  onDisconnect: () => void
}

const StyledModal = styled(Modal)`
  width: 100%;
  border-radius: 24px;
  padding: 0;
  overflow: hidden;
  ${ModalHeader} {
    display: none;
  }
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

const ActionButtonsContainer = styled(FlexGap)`
  padding: 16px 0px;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  ${({ theme }) => theme.mediaQueries.md} {
    padding: 16px;
  }
`

const DisconnectButton = styled(Button)`
  border-radius: 8px;
  height: 26px;
  background-color: ${({ theme }) => theme.colors.tertiary};
  color: ${({ theme }) => theme.colors.primary60};
  border-bottom: 2px solid #0000001a;
  &:hover {
    opacity: 0.8;
  }
`

const WalletModal: React.FC<WalletModalProps> = ({ account, onDismiss, isOpen, onReceiveClick, onDisconnect }) => {
  const { viewState } = useWalletModalV2ViewState()

  // If no account is provided, show a message or redirect
  if (!account && viewState !== ViewState.CLAIM_GIFT) {
    return null
  }
  return (
    <ModalV2 isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
      <StyledModal title={undefined} onDismiss={onDismiss} hideCloseButton bodyPadding="16px">
        <WalletContent
          account={account}
          onDisconnect={onDisconnect}
          onDismiss={onDismiss}
          onReceiveClick={onReceiveClick}
        />
      </StyledModal>
    </ModalV2>
  )
}

export const WalletContent = ({
  account,
  onDismiss,
  onReceiveClick,
  onDisconnect,
}: {
  account: string | undefined
  onDismiss: () => void
  onReceiveClick: () => void
  onDisconnect: () => void
}) => {
  const { view, setView } = useMenuTab()
  const { t } = useTranslation()
  const router = useRouter()
  const { isMobile } = useMatchBreakpoints()
  const { viewState, setViewState, goBack, setSendEntry } = useWalletModalV2ViewState()
  const { theme } = useTheme()

  const { chainId } = useActiveChainId()
  const { account: evmAccount, solanaAccount } = useAccountActiveChain()
  const [selectedReceiveAccount, setSelectedReceiveAccount] = useState<string | undefined>(undefined)
  const [selectedReceiveChain, setSelectedReceiveChain] = useState<'evm' | 'solana' | undefined>(undefined)

  // Wallet connection hooks for getting icons
  const { connectAsync } = useConnect()
  const { wallet: solanaWallet } = useWallet()
  const [previouslyUsedWalletsId] = useAtom(previouslyUsedWalletsAtom)
  const walletConfig = walletsConfig({ chainId, connect: connectAsync })

  // Get selected wallet icon
  const selectedWalletIcon = useMemo(() => {
    if (selectedReceiveChain === 'solana') {
      return solanaWallet?.adapter.icon as string | undefined
    }
    if (selectedReceiveChain === 'evm') {
      const evmWallet = walletConfig.find((w) => w.id === previouslyUsedWalletsId[0])
      return evmWallet?.icon as string | undefined
    }
    return undefined
  }, [selectedReceiveChain, solanaWallet, walletConfig, previouslyUsedWalletsId])

  // Fetch balances using the hook we created
  const { balances, isLoading, totalBalanceUsd } = useAddressBalance(account, {
    includeSpam: false,
    onlyWithPrice: false,
  })
  const balanceDisplay = useMemo(() => {
    const display = formatAmount(totalBalanceUsd)?.split('.')
    return {
      integer: display?.[0] || '',
      decimal: display?.[1] || '',
    }
  }, [totalBalanceUsd])

  const noAssets = (balances.length === 0 || totalBalanceUsd === 0) && !isLoading
  const handleClick = useCallback(
    (newIndex: number) => {
      setView(newIndex)
    },
    [setView],
  )

  const actionView = useMemo(() => {
    if (viewState === ViewState.GIFT_INFO_DETAIL) return <GiftInfoDetailView />

    // Receive Options
    if (viewState === ViewState.RECEIVE_OPTIONS) {
      return (
        <ReceiveOptionsView
          onSelectEVM={() => {
            setSelectedReceiveAccount(evmAccount)
            setSelectedReceiveChain('evm')
            setViewState(ViewState.RECEIVE_QR)
          }}
          onSelectSolana={() => {
            setSelectedReceiveAccount(solanaAccount ?? undefined)
            setSelectedReceiveChain('solana')
            setViewState(ViewState.RECEIVE_QR)
          }}
          evmAccount={evmAccount}
          solanaAccount={solanaAccount ?? undefined}
        />
      )
    }

    // Receive QR
    if (viewState === ViewState.RECEIVE_QR) {
      return (
        <ReceiveContent
          account={selectedReceiveAccount || account || ''}
          chainType={selectedReceiveChain}
          walletIcon={selectedWalletIcon}
        />
      )
    }

    // Claim Gift
    if ([ViewState.CLAIM_GIFT, ViewState.CLAIM_GIFT_CONFIRM].includes(viewState)) {
      return (
        <>
          {viewState === ViewState.CLAIM_GIFT ? (
            <ClaimGiftView setViewState={setViewState} />
          ) : (
            <ClaimGiftConfirmView />
          )}
        </>
      )
    }

    return (
      <SendAssets
        assets={balances}
        isLoading={isLoading}
        onViewStateChange={setViewState}
        viewState={viewState}
        onBack={goBack}
      />
    )
  }, [
    viewState,
    balances,
    isLoading,
    goBack,
    setViewState,
    evmAccount,
    solanaAccount,
    selectedReceiveAccount,
    selectedReceiveChain,
    selectedWalletIcon,
    account,
  ])

  return (
    <Box
      minWidth={isMobile ? '100%' : '357px'}
      maxHeight={isMobile ? 'auto' : 'calc(100vh - 80px)'}
      maxWidth={isMobile ? '100%' : '377px'}
      overflowY={isMobile ? undefined : 'auto'}
    >
      {account ? (
        <FlexGap mb="10px" gap="8px" justifyContent="space-between" alignItems="center" paddingRight="16px" mt="8px">
          {viewState > ViewState.SEND_ASSETS && (
            <FlexGap alignItems="center" gap="16px" ml={isMobile ? '8px' : '16px'}>
              <Button
                variant="tertiary"
                style={{ width: '34px', height: '34px', padding: '6px', borderRadius: '12px' }}
                onClick={goBack}
              >
                <ArrowBackIcon fontSize="24px" color={theme.colors.primary60} />
              </Button>
              {[ViewState.RECEIVE_OPTIONS, ViewState.RECEIVE_QR].includes(viewState) && (
                <Text fontSize="20px" fontWeight="600" color="text">
                  {t('Receive Crypto')}
                </Text>
              )}
            </FlexGap>
          )}

          {![ViewState.RECEIVE_OPTIONS, ViewState.RECEIVE_QR].includes(viewState) && (
            <CopyAddress tooltipMessage={t('Copied')} account={account || ''} />
          )}
          {viewState <= ViewState.SEND_ASSETS && (
            <FlexGap>
              <DisconnectButton scale="xs" onClick={onDisconnect}>
                {t('Disconnect')}
              </DisconnectButton>
            </FlexGap>
          )}
        </FlexGap>
      ) : null}

      <CancelGiftProvider>
        <Box padding={isMobile ? '0' : '0 16px 16px'}>
          {viewState >= ViewState.SEND_ASSETS ? (
            actionView
          ) : (
            <>
              <FlexGap alignItems="center" gap="3px">
                <TotalBalanceInteger>${balanceDisplay.integer}</TotalBalanceInteger>
                <TotalBalanceDecimal>.{balanceDisplay.decimal}</TotalBalanceDecimal>
              </FlexGap>
              <Text fontSize="20px" fontWeight="bold" mb="8px">
                {t('My Wallet')}
              </Text>
              {chainId !== NonEVMChainId.SOLANA && !noAssets && (
                <Box mb="16px" onClick={(e) => e.stopPropagation()}>
                  <TabsComponent
                    view={view}
                    handleClick={handleClick}
                    style={{ backgroundColor: 'transparent', padding: '0', borderBottom: 'none' }}
                  />
                </Box>
              )}
              {view === WalletView.GIFTS ? (
                <GiftsDashboard setViewState={setViewState} />
              ) : view === WalletView.WALLET_INFO && !noAssets ? (
                <Box mt="16px">
                  <Text fontSize="14px" color="textSubtle">
                    {t('Assets')}
                  </Text>

                  <AssetsList assets={balances} isLoading={isLoading} />
                </Box>
              ) : (
                !noAssets && (
                  <Box padding="16px 0" maxHeight="280px" overflow="auto">
                    <RecentTransactions />
                  </Box>
                )
              )}
            </>
          )}
        </Box>
      </CancelGiftProvider>
      {viewState === ViewState.WALLET_INFO && (
        <>
          {noAssets ? (
            chainId === NonEVMChainId.SOLANA ? (
              <EmptyWalletActions
                onDismiss={onDismiss}
                setViewState={setViewState}
                description={t('This wallet looks new. Does not have any assets.')}
              />
            ) : (
              <EmptyWalletActions onDismiss={onDismiss} setViewState={setViewState} />
            )
          ) : view === WalletView.GIFTS ? null : (
            <ActionButtonsContainer>
              <FlexGap gap="8px" width="100%">
                <ActionButton
                  onClick={() => {
                    router.push('/buy-crypto')
                    onDismiss()
                  }}
                  variant="tertiary"
                >
                  {t('Buy')}
                </ActionButton>
                <ActionButton
                  onClick={() => {
                    setViewState(ViewState.SEND_ASSETS)
                    setSendEntry(SEND_ENTRY.SEND_ONLY)
                  }}
                  variant="tertiary"
                >
                  {t('Send')}
                </ActionButton>
                <ActionButton
                  onClick={() => {
                    setViewState(ViewState.RECEIVE_OPTIONS)
                  }}
                  variant="tertiary"
                >
                  {t('Receive')}
                </ActionButton>
              </FlexGap>

              <Button
                variant="text"
                onClick={() => {
                  router.push('/bridge')
                  onDismiss()
                }}
              >
                {t('Bridge Crypto')}?
                <ArrowForwardIcon color="primary" />
              </Button>
            </ActionButtonsContainer>
          )}
        </>
      )}
    </Box>
  )
}

export default WalletModal
