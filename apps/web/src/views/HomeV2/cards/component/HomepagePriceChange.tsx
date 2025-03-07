import { Text, TriangleDownIcon, TriangleUpIcon } from '@pancakeswap/uikit'
import { HomePageToken } from 'pages/api/home/types'
import styled from 'styled-components'

const Percent = styled(Text)`
  font-family: Kanit;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  letter-spacing: 0%;
  color: ${({ theme }) => theme.colors.textSubtle};
  display: flex;
  align-items: center;
  justify-content: center;
`

export const HomepagePriceChange = ({ token }: { token: HomePageToken }) => {
  return (
    <Percent ml="2px">
      {token.percent > 0 && <TriangleUpIcon />}
      {token.percent < 0 && <TriangleDownIcon />}
      {token.percent.toFixed(2)}%
    </Percent>
  )
}
