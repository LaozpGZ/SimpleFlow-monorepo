import { useTranslation } from '@pancakeswap/localization'
import { ArrowForwardIcon, Box, Button, Flex, Text } from '@pancakeswap/uikit'
import { styled } from 'styled-components'

interface ReceiveOptionsViewProps {
  onSelectEVM: () => void
  onSelectSolana: () => void
  evmAccount?: string
  solanaAccount?: string
}

const OptionCard = styled(Button)`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => (theme.isDark ? '#55496E' : '#D7CAEC')};
  border-radius: 16px;
  padding: 20px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`

const IconContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
`

const ChainIcon = styled(Box)<{ colors: string[] }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  ${({ colors }) =>
    colors
      .map(
        (color, index) => `
    &::before {
      content: '';
      position: absolute;
      width: ${16 + index * 8}px;
      height: ${16 + index * 8}px;
      background: ${color};
      border-radius: 4px;
      z-index: ${colors.length - index};
    }
  `,
      )
      .join('')}
`

const ReceiveOptionsView: React.FC<ReceiveOptionsViewProps> = ({
  onSelectEVM,
  onSelectSolana,
  evmAccount,
  solanaAccount,
}) => {
  const { t } = useTranslation()

  return (
    <Box padding="24px" maxWidth="450px" width="100%">
      <Text fontSize="24px" fontWeight="600" mb="8px" textAlign="center">
        {t('Receive Crypto')}
      </Text>
      <Text fontSize="14px" color="textSubtle" textAlign="center" mb="32px">
        {t('Select a blockchain to receive crypto')}
      </Text>

      <Box>
        <OptionCard variant="tertiary" onClick={onSelectEVM}>
          <Flex alignItems="center">
            <IconContainer>
              <ChainIcon colors={['#F0B90B', '#627EEA', '#FF6B35', '#8247E5']}>
                {/* Multiple blockchain icons represented as stacked squares */}
              </ChainIcon>
              <Box>
                <Text fontSize="18px" fontWeight="600" color="text">
                  EVM
                </Text>
                <Text fontSize="12px" color="textSubtle">
                  {evmAccount ? `${evmAccount.slice(0, 6)}...${evmAccount.slice(-4)}` : 'No EVM wallet'}
                </Text>
              </Box>
            </IconContainer>
          </Flex>
          <ArrowForwardIcon color="textSubtle" />
        </OptionCard>

        <OptionCard variant="tertiary" onClick={onSelectSolana}>
          <Flex alignItems="center">
            <IconContainer>
              <ChainIcon colors={['#9945FF', '#14F195']}>{/* Solana gradient colors */}</ChainIcon>
              <Box>
                <Text fontSize="18px" fontWeight="600" color="text">
                  Solana
                </Text>
                <Text fontSize="12px" color="textSubtle">
                  {solanaAccount ? `${solanaAccount.slice(0, 6)}...${solanaAccount.slice(-4)}` : 'No Solana wallet'}
                </Text>
              </Box>
            </IconContainer>
          </Flex>
          <ArrowForwardIcon color="textSubtle" />
        </OptionCard>
      </Box>
    </Box>
  )
}

export default ReceiveOptionsView
