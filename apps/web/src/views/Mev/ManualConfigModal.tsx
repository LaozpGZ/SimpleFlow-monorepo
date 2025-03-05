import { useTranslation } from '@pancakeswap/localization'
import {
  Card,
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
