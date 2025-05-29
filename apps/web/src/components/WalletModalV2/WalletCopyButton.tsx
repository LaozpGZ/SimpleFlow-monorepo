import { previouslyUsedWalletsAtom } from '@pancakeswap/ui-wallets'
import { Box, CopyButton, Flex, FlexProps, Image, Text, WalletFilledV2Icon } from '@pancakeswap/uikit'
import { ASSET_CDN } from 'config/constants/endpoints'
import { walletsConfig } from 'config/wallet'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useAtom } from 'jotai'
import { useMemo } from 'react'
import { styled } from 'styled-components'
import { useAccount, useConnect } from 'wagmi'

interface CopyAddressProps extends FlexProps {
  account: string | undefined
  tooltipMessage: string
}

const Wrapper = styled(Flex)`
  align-items: center;
  justify-content: flex-start;
  border-radius: 16px;
  position: relative;
  padding: 8px 16px;
`

const WalletIcon = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: 12px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
`

const AddressBox = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;
`

const WalletAddress = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin-right: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
`

const CopyButtonWrapper = styled(Box)`
  margin-left: 8px;
`
const DAPP_LIST = ['isBinance', 'isCoinbaseWallet', 'isOkxWallet', 'isTokenPocket']
const DAPP_WALLET_ICON = {
  [DAPP_LIST[0]]: `${ASSET_CDN}/web/wallets/binance-w3w.png`,
  [DAPP_LIST[1]]: `${ASSET_CDN}/web/wallets/coinbase.png`,
  [DAPP_LIST[2]]: `${ASSET_CDN}/web/wallets/okx-wallet.png`,
  [DAPP_LIST[3]]: `${ASSET_CDN}/web/wallets/tokenpocket.png`,
}

const useDappIcon = () => {
  const { connector } = useAccount()
  const dappIcon = useMemo(() => {
    const isDappWallet = DAPP_LIST.some((d) => connector?.provider?.[d] === true)
    if (!isDappWallet) return undefined
    const walletName = DAPP_LIST.find((d) => connector?.provider?.[d] === true)
    if (!walletName) return undefined
    return DAPP_WALLET_ICON?.[walletName]
  }, [connector])
  return { dappIcon }
}

export const CopyAddress: React.FC<React.PropsWithChildren<CopyAddressProps>> = ({
  account,
  tooltipMessage,
  ...props
}) => {
  const { connectAsync } = useConnect()
  const { chainId } = useActiveChainId()

  const [previouslyUsedWalletsId] = useAtom(previouslyUsedWalletsAtom)

  const walletConfig = walletsConfig({ chainId, connect: connectAsync })

  const wallet = useMemo(() => walletConfig.find((w) => w.id === previouslyUsedWalletsId[0]), [walletConfig])
  const { dappIcon } = useDappIcon()

  // Format the address to show only the first 6 and last 4 characters
  const formatAddress = (address: string | undefined) => {
    if (!address) return ''
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <Box position="relative" {...props} onClick={(e) => e.stopPropagation()}>
      <Wrapper>
        <WalletIcon>
          {wallet?.icon || dappIcon ? (
            <Image src={(wallet?.icon as string) || dappIcon} width={40} height={40} alt="Wallet" />
          ) : (
            <WalletFilledV2Icon width={28} height={28} color="primary" />
          )}
        </WalletIcon>
        <AddressBox>
          <WalletAddress title={account}>{formatAddress(account)}</WalletAddress>
        </AddressBox>
        <CopyButtonWrapper>
          <CopyButton width="16px" text={account ?? ''} tooltipMessage={tooltipMessage} />
        </CopyButtonWrapper>
      </Wrapper>
    </Box>
  )
}
