import { Box, BoxProps, ScanLink, Table, Text } from '@pancakeswap/uikit'
import truncateHash from '@pancakeswap/utils/truncateHash'
import { styled } from 'styled-components'

const StyledTable = styled(Table)`
  width: 100%;
  background-color: ${({ theme }) => theme.card.background};
  padding: 8px;

  border-radius: ${({ theme }) => theme.radii.card};

  td,
  th {
    padding: 16px;
    vertical-align: middle;
  }

  th {
    color: ${({ theme }) => theme.colors.secondary};
    font-size: 12px;
    text-transform: uppercase;
    font-weight: 600;
  }

  tr {
    border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
    &:last-child {
      border-bottom: none;
    }
  }

  @media screen and (max-width: 900px) {
    td:nth-child(6),
    th:nth-child(6) {
      display: none;
    }
  }

  @media screen and (max-width: 800px) {
    td:nth-child(4),
    th:nth-child(4),
    td:nth-child(5),
    th:nth-child(5) {
      display: none;
    }
  }

  @media screen and (max-width: 500px) {
    td:nth-child(3),
    th:nth-child(3) {
      display: none;
    }
  }
`

const StyledScanLink = styled(ScanLink)`
  &:hover {
    text-decoration: none;
    opacity: 0.8;
  }
`

export const RealTimeBurnHistoryCard = (props: BoxProps) => {
  return (
    <Box {...props}>
      <StyledTable>
        <thead>
          <tr>
            <th>Tx Hash</th>
            <th>Amount</th>
            <th>Timestamp</th>
            <th>From</th>
            <th>To</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <StyledScanLink href="#">
                <Text>{truncateHash('0xef5546edb...ef5546edb')}</Text>
              </StyledScanLink>
            </td>
            <td>
              <Text>1.27 CAKE</Text>
            </td>
            <td>
              <Text>1 minute ago</Text>
            </td>
            <td>
              <Text>{truncateHash('0x0753...F2cD')}</Text>
            </td>
            <td>
              <Text>{truncateHash('0x0753...F2cD')}</Text>
            </td>
            <td>
              <Text color="textSubtle">Transfer</Text>
            </td>
          </tr>
          <tr>
            <td>
              <StyledScanLink href="#">
                <Text>{truncateHash('0xef5546edb...ef5546edb')}</Text>
              </StyledScanLink>
            </td>
            <td>
              <Text>127,382,283 CAKE</Text>
            </td>
            <td>
              <Text>1 minute ago</Text>
            </td>
            <td>
              <Text>{truncateHash('0x0753...F2cD')}</Text>
            </td>
            <td>
              <Text>{truncateHash('0x0753...F2cD')}</Text>
            </td>
            <td>
              <Text color="textSubtle">Transfer</Text>
            </td>
          </tr>
        </tbody>
      </StyledTable>
    </Box>
  )
}
