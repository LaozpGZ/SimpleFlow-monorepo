import Page from 'components/Layout/Page'
import styled, { css } from 'styled-components'
import { ArrowForwardIcon, Box, Card, CardBody, Container, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { LightGreyCard, NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { getChainName } from '@pancakeswap/chains'
import { BreadcrumbNav } from './components/BreadcrumbNav'

const StyledBox = styled(Box)`
  background: ${({ theme }) => theme.colors.backgroundPage};
`

const StyledCard = styled(LightGreyCard)<{ $disabled?: boolean }>`
  border-radius: 24px;
  border-color: ${({ theme }) => theme.colors.inputSecondary};

  padding: 12px 16px;

  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: center;

  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 0.125s ease-out;

  .arrow-icon {
    opacity: 0.5;
    transition: opacity 0.2s ease-out;
  }

  ${({ $disabled }) =>
    !$disabled &&
    css`
      &:hover {
        background-color: ${({ theme }) => theme.colors.input};

        .arrow-icon {
          opacity: 1;
        }
      }

      &:active {
        background-color: ${({ theme }) => theme.colors.inputSecondary};
      }
    `}
`

export const CreateLiquiditySelector = () => {
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()

  const chainName = getChainName(chainId)

  return (
    <StyledBox>
      <Page>
        <Box mt="2px">
          <BreadcrumbNav />
        </Box>
        <Container px="0" mt="24px" maxWidth={[null, null, null, '520px']}>
          <Card>
            <CardBody>
              <Text>{t('Select the DEX type of the liquidity pool')}</Text>

              <NextLinkFromReactRouter to={`/liquidity/create/${chainName}/v3`}>
                <StyledCard mt="16px">
                  <Box>
                    <Text fontSize="20px" color="secondary" bold>
                      {t('V3 Pool')}
                    </Text>
                    <Text small>
                      {t(
                        'Advanced pools where you choose specific price ranges to provide liquidity, earning higher fees in your chosen range.',
                      )}
                    </Text>
                  </Box>
                  <Box>
                    <ArrowForwardIcon width="24px" height="24px" className="arrow-icon" />
                  </Box>
                </StyledCard>
              </NextLinkFromReactRouter>
            </CardBody>
          </Card>
        </Container>
      </Page>
    </StyledBox>
  )
}
