import { useTranslation } from '@pancakeswap/localization'
import { Button, Flex, Image, Text } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { CardRowLayout } from './component/CardRowLayout'
import { CardSection } from './component/CardSection'

const PriceText = styled(Text)`
  font-weight: 600;
  font-size: 24px;
  line-height: 36px;
  color: ${({ theme }) => theme.colors.success};
`

const PercentageText = styled(Text)`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSubtle};
`

const WinnerText = styled(Text)`
  font-weight: 600;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text};
`

const PlayButton = styled(Button).attrs({ variant: 'primary', scale: 'sm' })``

export const PredictionCard = () => {
  const { t } = useTranslation()

  return (
    <CardSection title={t('BNB 5 min. Prediction')} button={<PlayButton>{t('Play')} →</PlayButton>}>
      <CardRowLayout
        left={
          <Flex alignItems="center">
            <Image src="/images/tokens/bnb.png" width={32} height={32} alt="BNB" />
            <WinnerText ml="8px">BNBUSD</WinnerText>
          </Flex>
        }
      >
        <Flex alignItems="center">
          <PriceText>$568.11</PriceText>
          <PercentageText ml="4px">▲ 0.74%</PercentageText>
        </Flex>
      </CardRowLayout>
      <CardRowLayout
        left={
          <Flex alignItems="center">
            <Image src="/images/profile-pic.png" width={32} height={32} alt="Winner" />
            <Text ml="8px" color="textSubtle">
              {t('Last Top Winner')}
            </Text>
          </Flex>
        }
        isLast
      >
        <Flex alignItems="center">
          <WinnerText>0xHysC...0114</WinnerText>
          <PriceText ml="8px">+1.28 BNB</PriceText>
        </Flex>
      </CardRowLayout>
    </CardSection>
  )
}
