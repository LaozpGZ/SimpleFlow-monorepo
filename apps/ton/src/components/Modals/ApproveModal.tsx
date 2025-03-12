import { useTranslation } from '@pancakeswap/localization'
import { Box, CircleLoader, FlexGap, Text } from '@pancakeswap/uikit'
import { CurrencyLogo } from 'components/widgets'
import { NumberDisplay } from 'components/widgets/NumberDisplay'
import styled from 'styled-components'

const StyledFlexGap = styled(FlexGap).attrs({ flexDirection: 'column' })`
  text-align: center;
  min-height: 160px;
`

interface ApproveModalProps {
  currency?: string
  amount?: string
}

export const ApproveModal = ({ currency, amount }: ApproveModalProps) => {
  const { t } = useTranslation()
  const truncatedWalletAddress = '0x...0000'

  return (
    <StyledFlexGap gap="8px">
      <Box>
        <CurrencyLogo
          currency={{
            logoURI: '',
          }}
          size="40px"
        />
        <FlexGap justifyContent="center" alignItems="center" gap="4px">
          <NumberDisplay value={amount} fontSize="24px" bold />
          <Text fontSize="24px" bold>
            {currency}
          </Text>
        </FlexGap>
      </Box>
      <FlexGap mt="auto" justifyContent="center" alignItems="center" gap="8px">
        <Text color="textSubtle">
          {t('Please approve it in your wallet:')} {truncatedWalletAddress}
        </Text>
        <CircleLoader size="14px" stroke="#7A6EAA" />
      </FlexGap>
    </StyledFlexGap>
  )
}
