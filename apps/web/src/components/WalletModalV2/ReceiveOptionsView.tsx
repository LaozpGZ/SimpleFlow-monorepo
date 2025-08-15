import { useTranslation } from '@pancakeswap/localization'
import { ArrowForwardIcon, Box, Button, Flex, Text } from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import { useAccount } from 'wagmi'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAccountActiveChain } from 'hooks/useAccountActiveChain'
import { NonEVMChainId } from '@pancakeswap/chains'

interface ReceiveOptionsViewProps {
  onSelectEVM: () => void
  onSelectSolana: () => void
  evmAccount?: string
  solanaAccount?: string
}

const OptionCard = styled(Button)`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => (theme.isDark ? '#372F47' : '#E7E3EB')};
  border-radius: 20px;
  padding: 16px 20px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  transition: all 0.2s ease;
  height: 64px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
`

const IconContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
`

const ChainIconWrapper = styled(Box)`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`

const EVMIcon = styled(Box)`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #627eea 0%, #4a6cf7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 2px;
    clip-path: polygon(
      50% 0%,
      0% 25%,
      37.5% 25%,
      37.5% 75%,
      0% 75%,
      50% 100%,
      100% 75%,
      62.5% 75%,
      62.5% 25%,
      100% 25%
    );
  }
`

const SolanaIcon = styled(Box)`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #9945ff 0%, #14f195 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    width: 24px;
    height: 20px;
    background-image: url("data:image/svg+xml,%3Csvg width='24' height='20' viewBox='0 0 24 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.5 6.5C3.5 5.67157 4.17157 5 5 5H19.5C20.3284 5 21 5.67157 21 6.5V7.5C21 8.32843 20.3284 9 19.5 9H5C4.17157 9 3.5 8.32843 3.5 7.5V6.5Z' fill='white'/%3E%3Cpath d='M3.5 12.5C3.5 11.6716 4.17157 11 5 11H19.5C20.3284 11 21 11.6716 21 12.5V13.5C21 14.3284 20.3284 15 19.5 15H5C4.17157 15 3.5 14.3284 3.5 13.5V12.5Z' fill='white'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }
`

const WalletIcon = styled(Box)<{ walletType: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  position: absolute;
  bottom: -2px;
  right: -2px;
  border: 2px solid ${({ theme }) => theme.colors.backgroundAlt};
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;

  ${({ walletType }) => {
    switch (walletType) {
      case 'metaMask':
        return `
          background: linear-gradient(135deg, #F6851B 0%, #E2761B 100%);
          &::after {
            content: '🦊';
            font-size: 8px;
            line-height: 1;
          }
        `
      case 'walletConnect':
        return `
          background: #3B99FC;
          background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.5 6.5C3.5 5.67157 4.17157 5 5 5H11C11.8284 5 12.5 5.67157 12.5 6.5V9.5C12.5 10.3284 11.8284 11 11 11H5C4.17157 11 3.5 10.3284 3.5 9.5V6.5Z' fill='white'/%3E%3C/svg%3E");
        `
      case 'coinbase':
        return `
          background: #0052FF;
          &::after {
            content: '';
            position: absolute;
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 2px;
          }
        `
      case 'phantom':
        return `
          background: linear-gradient(135deg, #AB9FF2 0%, #4E44CE 100%);
          &::after {
            content: '👻';
            font-size: 8px;
            line-height: 1;
          }
        `
      case 'solflare':
        return `
          background: linear-gradient(135deg, #FC8B2B 0%, #FFBA2E 100%);
          &::after {
            content: '☀';
            font-size: 8px;
            line-height: 1;
          }
        `
      default:
        return `
          background: #666;
          &::after {
            content: '💳';
            font-size: 8px;
            line-height: 1;
          }
        `
    }
  }}
`

const ReceiveOptionsView: React.FC<ReceiveOptionsViewProps> = ({
  onSelectEVM,
  onSelectSolana,
  evmAccount,
  solanaAccount,
}) => {
  const { t } = useTranslation()
  const { connector } = useAccount()
  const { wallet: solanaWallet } = useWallet()
  const { chainId } = useAccountActiveChain()

  // Determine wallet type based on connector/wallet
  const getWalletType = (isEVM: boolean) => {
    if (isEVM) {
      // For EVM chains
      const connectorName = connector?.name?.toLowerCase() || ''
      if (connectorName.includes('metamask')) return 'metaMask'
      if (connectorName.includes('walletconnect')) return 'walletConnect'
      if (connectorName.includes('coinbase')) return 'coinbase'
      return 'metaMask' // default for EVM
    }

    // For Solana
    const walletName = solanaWallet?.adapter?.name?.toLowerCase() || ''
    if (walletName.includes('phantom')) return 'phantom'
    if (walletName.includes('solflare')) return 'solflare'
    return 'phantom' // default for Solana
  }

  const evmWalletType = getWalletType(true)
  const solanaWalletType = getWalletType(false)

  return (
    <Box padding="24px" maxWidth="450px" width="100%">
      <Text fontSize="20px" fontWeight="600" mb="24px" color="text">
        {t('Receive')}
      </Text>

      <Box>
        <OptionCard variant="tertiary" onClick={onSelectEVM}>
          <Flex alignItems="center">
            <IconContainer>
              <ChainIconWrapper>
                <EVMIcon />
                <WalletIcon walletType={evmWalletType} />
              </ChainIconWrapper>
              <Box>
                <Text fontSize="16px" fontWeight="600" color="text">
                  EVM
                </Text>
                <Text fontSize="12px" color="textSubtle">
                  {evmAccount ? `${evmAccount.slice(0, 6)}...${evmAccount.slice(-4)}` : 'No EVM wallet'}
                </Text>
              </Box>
            </IconContainer>
          </Flex>
          <ArrowForwardIcon color="textSubtle" width="16px" />
        </OptionCard>

        <OptionCard variant="tertiary" onClick={onSelectSolana}>
          <Flex alignItems="center">
            <IconContainer>
              <ChainIconWrapper>
                <SolanaIcon />
                <WalletIcon walletType={solanaWalletType} />
              </ChainIconWrapper>
              <Box>
                <Text fontSize="16px" fontWeight="600" color="text">
                  Solana
                </Text>
                <Text fontSize="12px" color="textSubtle">
                  {solanaAccount ? `${solanaAccount.slice(0, 6)}...${solanaAccount.slice(-4)}` : 'No Solana wallet'}
                </Text>
              </Box>
            </IconContainer>
          </Flex>
          <ArrowForwardIcon color="textSubtle" width="16px" />
        </OptionCard>
      </Box>
    </Box>
  )
}

export default ReceiveOptionsView
