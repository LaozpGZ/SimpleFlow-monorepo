import { useTranslation } from '@pancakeswap/localization'
import {
  Card,
  CopyIcon,
  copyText,
  FlexGap,
  LinkExternal,
  Message,
  MessageText,
  ModalBody,
  Text,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import { rpcData } from './constant'
import { getImageUrl } from './utils'

const UnderLineBox = styled.div`
  position: relative;
  flex-grow: 1;
  height: 100%;
  &::before {
    content: '';
    position: absolute;
    height: 100%;
    top: 0px;
    left: 0;
    width: 100%;
    border-bottom: 1px dotted ${({ theme }) => theme.colors.cardBorder};
  }
`

const walletConfig = [
  {
    title: 'Trust Wallet',
    image: 'trust.png',
    doc: 'https://community.trustwallet.com/t/how-to-add-a-custom-network-on-the-trust-wallet-mobile-app/626781',
  },
  {
    title: 'Rabbit Wallet',
    image: 'safepal.png',
    doc: 'https://support.rabby.io/hc/en-us',
  },
  {
    title: 'SafePal',
    image: 'safepal.png',
    doc: 'https://safepalsupport.zendesk.com/hc/en-us/articles/14688426876443-How-to-add-a-Custom-network-in-the-SafePal-software-wallet',
  },
  {
    title: 'Others',
    image: 'others.png',
    doc: 'https://support.metamask.io/networks-and-sidechains/managing-networks/how-to-add-a-custom-network-rpc/',
  },
]

export const ManualConfigModal: React.FC = () => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()
  return (
    <ModalBody maxWidth="440px" p="24px">
      <FlexGap gap="24px" flexDirection="column" alignItems="center" minWidth="340px">
        <Text>
          <Text bold>{t('PancakeSwap MEV Guard')}</Text>
          {t('requires a manual configuration for your wallet. Choose your wallet to view a detailed guide:')}
        </Text>
        <FlexGap
          maxWidth="588px"
          gap="40px"
          flexWrap={isMobile ? 'wrap' : 'nowrap'}
          alignItems="center"
          justifyContent="center"
        >
          {walletConfig.map((wallet) => (
            <FlexGap
              flexDirection="column"
              alignItems="center"
              gap="8px"
              onClick={() => {
                window.open(wallet.doc, '_blank', 'noopener noreferrer')
              }}
              style={{ cursor: 'pointer' }}
            >
              <img src={getImageUrl(wallet.image)} alt={wallet.title} width="36px" />
              <Text fontSize="12px" lineHeight="15px" bold color="#02919D">
                {t(wallet.title)}
              </Text>
            </FlexGap>
          ))}
        </FlexGap>
        <Card innerCardProps={{ p: '16px' }}>
          <Text fontSize="20px" bold mb="16px">
            {t('Or add manually this RPC endpoint to your wallet')}
          </Text>
          <FlexGap gap="8px" flexDirection="column">
            {Object.entries(rpcData).map(([key, value]) => (
              <FlexGap gap="8px" alignItems="center" key={key} flexWrap={isMobile ? 'wrap' : 'nowrap'}>
                <Text>{key}:</Text>
                <UnderLineBox />
                <Text bold>{value}</Text>
                <CopyIcon cursor="pointer" color="#02919D" onClick={() => copyText(value)} />
              </FlexGap>
            ))}
          </FlexGap>
        </Card>

        <Message variant="success">
          <FlexGap gap="8px" flexDirection="column" alignItems="flex-start">
            <MessageText>
              {t(`If you've already set this up manually, no action is needed - just proceed with the swap!`)}
            </MessageText>
            <LinkExternal href="https://docs.pancakeswap.finance/pancake-swap-docs/pancakeswap-features/mev-protection">
              {t('Learn more')}
            </LinkExternal>
          </FlexGap>
        </Message>
      </FlexGap>
    </ModalBody>
  )
}
