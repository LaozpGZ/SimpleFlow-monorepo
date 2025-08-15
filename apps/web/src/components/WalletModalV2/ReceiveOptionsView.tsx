import { ArrowForwardIcon, Box, Flex, Text, Image, WalletFilledV2Icon, FlexGap } from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import { useConnect } from 'wagmi'
import { useWallet } from '@solana/wallet-adapter-react'
import { ASSET_CDN } from 'config/constants/endpoints'
import { previouslyUsedWalletsAtom } from '@pancakeswap/ui-wallets'
import { walletsConfig } from 'config/wallet'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useAtom } from 'jotai'
import { useMemo } from 'react'

interface ReceiveOptionsViewProps {
  onSelectEVM: () => void
  onSelectSolana: () => void
  evmAccount?: string
  solanaAccount?: string
}

const OptionCard = styled(Box)`
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
  cursor: pointer;

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
  overflow: visible;
`

const EVMIcon = styled(Box)`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #627eea;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background-image: url('${ASSET_CDN}/web/chains/svg/1.svg');
  background-size: 24px 24px;
  background-repeat: no-repeat;
  background-position: center;
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
  background-image: url('${ASSET_CDN}/web/chains/8000001001.png');
  background-size: 32px 32px;
  background-repeat: no-repeat;
  background-position: center;
`

const WalletIconWrapper = styled(Box)`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  position: absolute;
  bottom: -4px;
  right: -4px;
  border: 2px solid ${({ theme }) => theme.colors.backgroundAlt};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  z-index: 10;
`

const ReceiveOptionsView: React.FC<ReceiveOptionsViewProps> = ({
  onSelectEVM,
  onSelectSolana,
  evmAccount,
  solanaAccount,
}) => {
  const { connectAsync } = useConnect()
  const { chainId } = useActiveChainId()
  const { wallet: solanaWallet } = useWallet()

  const [previouslyUsedWalletsId] = useAtom(previouslyUsedWalletsAtom)
  const walletConfig = walletsConfig({ chainId, connect: connectAsync })

  // Get EVM wallet icon
  const evmWalletIcon = useMemo(() => {
    const evmWallet = walletConfig.find((w) => w.id === previouslyUsedWalletsId[0])
    return evmWallet?.icon
  }, [walletConfig, previouslyUsedWalletsId])

  // Get Solana wallet icon
  const solanaWalletIcon = useMemo(() => {
    return solanaWallet?.adapter.icon
  }, [solanaWallet])

  return (
    <Box padding="12px 0px" maxWidth="450px" width="100%" mt="24px">
      <FlexGap gap="12px">
        <OptionCard onClick={onSelectEVM}>
          <Flex alignItems="center">
            <IconContainer>
              <ChainIconWrapper>
                <EVMIcon />
                <WalletIconWrapper>
                  {evmWalletIcon ? (
                    <Image src={evmWalletIcon as string} width={16} height={16} alt="EVM Wallet" />
                  ) : (
                    <WalletFilledV2Icon width={12} height={12} color="primary" />
                  )}
                </WalletIconWrapper>
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
          <ArrowForwardIcon color="textSubtle" width="20px" height="20px" />
        </OptionCard>

        <OptionCard onClick={onSelectSolana}>
          <Flex alignItems="center">
            <IconContainer>
              <ChainIconWrapper>
                <SolanaIcon />
                <WalletIconWrapper>
                  {solanaWalletIcon ? (
                    <Image src={solanaWalletIcon} width={16} height={16} alt="Solana Wallet" />
                  ) : (
                    <WalletFilledV2Icon width={12} height={12} color="primary" />
                  )}
                </WalletIconWrapper>
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
          <ArrowForwardIcon color="textSubtle" width="20px" height="20px" />
        </OptionCard>
      </FlexGap>
    </Box>
  )
}

export default ReceiveOptionsView
