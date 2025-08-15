import { useTranslation } from '@pancakeswap/localization'
import { Box, CopyIcon, Flex, Text, Image, WalletFilledV2Icon } from '@pancakeswap/uikit'
import { useState, useMemo } from 'react'
import { styled } from 'styled-components'
import { useConnect } from 'wagmi'
import { useWallet } from '@solana/wallet-adapter-react'
import { ASSET_CDN } from 'config/constants/endpoints'
import { previouslyUsedWalletsAtom } from '@pancakeswap/ui-wallets'
import { walletsConfig } from 'config/wallet'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useAtom } from 'jotai'
import { NonEVMChainId } from '@pancakeswap/chains'

interface QRCodeCopyButtonProps {
  account: string
}

const CopyContainer = styled(Box)`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => (theme.isDark ? '#372F47' : '#E7E3EB')};
  border-radius: 16px;
  padding: 16px 20px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  height: 64px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
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

const CopyButton = styled(Box)`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.input};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};

    svg {
      color: white !important;
    }
  }
`

const QRCodeCopyButton: React.FC<QRCodeCopyButtonProps> = ({ account }) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const { connectAsync } = useConnect()
  const { chainId } = useActiveChainId()
  const { wallet: solanaWallet } = useWallet()

  const [previouslyUsedWalletsId] = useAtom(previouslyUsedWalletsAtom)
  const walletConfig = walletsConfig({ chainId, connect: connectAsync })

  // Determine if current chain is Solana
  const isSolana = chainId === NonEVMChainId.SOLANA

  // Get wallet icon
  const walletIcon = useMemo(() => {
    if (isSolana) {
      return solanaWallet?.adapter.icon
    }
    const evmWallet = walletConfig.find((w) => w.id === previouslyUsedWalletsId[0])
    return evmWallet?.icon
  }, [isSolana, solanaWallet, walletConfig, previouslyUsedWalletsId])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(account)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <Box width="100%" mt="16px">
      <CopyContainer>
        <Flex alignItems="center">
          <IconContainer>
            <ChainIconWrapper>
              {isSolana ? <SolanaIcon /> : <EVMIcon />}
              <WalletIconWrapper>
                {walletIcon ? (
                  <Image src={walletIcon as string} width={16} height={16} alt="Wallet" />
                ) : (
                  <WalletFilledV2Icon width={12} height={12} color="primary" />
                )}
              </WalletIconWrapper>
            </ChainIconWrapper>
            <Box>
              <Text fontSize="16px" fontWeight="600" color="text">
                {isSolana ? 'Solana' : 'EVM'}
              </Text>
              <Text fontSize="12px" color="textSubtle">
                {formatAddress(account)}
              </Text>
            </Box>
          </IconContainer>
        </Flex>

        <CopyButton onClick={handleCopy}>
          <CopyIcon width="20px" height="20px" color={copied ? 'white' : 'textSubtle'} />
        </CopyButton>
      </CopyContainer>
    </Box>
  )
}

export default QRCodeCopyButton
