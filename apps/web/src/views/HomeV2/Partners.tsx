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
  width: 111;
  height: 128;
  border-radius: 24px;
  border-top-width: 1px;
  border-right-width: 1px;
  border-bottom-width: 2px;
  border-width: 1px;
  border-style: solid;
  border-left-width: 1px;
  border-color: transparent;
  box-sizing: border-box;
  transition: all 0.3s;
  padding: 12px;
  &: hover {
    background: ${({ theme }) => theme.colors.primary10};
    border-width: 1px, 1px, 2px, 1px;
    border-style: solid;
    border-color: ${({ theme }) => theme.colors.primary20};
  }
`

const TextWrapper = styled(Text)`
  font-family: Kanit;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0%;
  text-align: center;
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.textSubtle};
`
