import { Box, IconButton, Input, SwapHorizIcon, Text } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { FormContainer } from 'views/SwapSimplify/InfinitySwap/FormContainer'
import { QuickActionButtons } from './QuickActionButtons'

const InputContainer = styled(Box)`
  position: relative;
  width: 100%;
`

const StyledInput = styled(Input).attrs({ scale: 'lg' })`
  height: 100px;

  padding-top: 24px;
  padding-bottom: 16px;
  padding-left: 40%;

  border-radius: 24px;

  text-align: right;
  font-size: 24px;
  font-weight: 600;
`

const InputTopBar = styled(Box)`
  position: absolute;
  top: 12px;
  left: 16px;
  right: 16px;

  display: flex;
  align-items: center;
  justify-content: space-between;
`

const InputBottomBar = styled(Box)`
  position: absolute;

  width: fit-content;

  bottom: 8px;
  right: 16px;

  text-align: right;
`

const InputLeftBox = styled(Box)`
  position: absolute;

  left: 16px;
  top: 48%;
`

function truncateString(str: string, maxLength: number) {
  if (!str || typeof str !== 'string') return ''
  if (str.length < maxLength) return str
  return `${str.slice(0, maxLength)}...`
}

export const MarketPricePanel = () => {
  return (
    <FormContainer>
      <InputContainer>
        <InputTopBar>
          <Text color="textSubtle" small>
            Sell when 1{' '}
            <Text as="span" color="textSubtle" small bold>
              BNB
            </Text>{' '}
            is worth:
          </Text>
          <IconButton variant="text" scale="xs">
            <SwapHorizIcon color="primary60" width="18px" />
          </IconButton>
        </InputTopBar>
        <InputLeftBox>
          <Text color="textSubtle" fontSize="20px" bold>
            {truncateString('CAKE', 15)}
          </Text>
        </InputLeftBox>
        <StyledInput type="number" placeholder="0.00" />
        <InputBottomBar>
          <Text color="textSubtle" small>
            ~827.05 USD
          </Text>
        </InputBottomBar>
      </InputContainer>

      <QuickActionButtons />
    </FormContainer>
  )
}
