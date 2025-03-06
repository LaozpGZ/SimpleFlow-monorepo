import { Flex, Text } from '@pancakeswap/uikit'
import { HomePagePartner } from 'pages/api/home/types'
import styled from 'styled-components'

type Props = {
  partners: HomePagePartner[]
}

export const Partners = ({ partners }: Props) => {
  return (
    <Container
      style={{
        marginTop: '60px',
        marginBottom: '120px',
      }}
    >
      {partners.map((partner) => (
        <LinkItem key={partner.link} href={partner.link} target="_blank" rel="noopener noreferrer">
          <img
            src={partner.logo}
            alt={partner.name}
            style={{
              width: '80px',
              height: '80px',
            }}
          />
          <TextWrapper>{partner.name}</TextWrapper>
        </LinkItem>
      ))}
    </Container>
  )
}

const Container = styled(Flex)`
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
`

const LinkItem = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
`

const TextWrapper = styled(Text)`
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: bold;
  text-align: center;
`
