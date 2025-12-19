import { ArticleDataType } from '@pancakeswap/blog'
import { useTranslation } from '@pancakeswap/localization'
import { Box, Card, Flex, Text } from '@pancakeswap/uikit'
import { useQuery } from '@tanstack/react-query'
import { StyledLineClamp } from 'components/StyledLineClamp'
import NextLink from 'next/link'
import { useMemo } from 'react'
import { styled } from 'styled-components'

const StyledBackground = styled(Box)`
  position: relative;
  padding: 45px 16px 0 16px;
`

const StyledGradientBg = styled('div')`
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  width: 100%;
  height: 65%;
  background: ${({ theme }) => theme.colors.gradientBubblegum};
  border-bottom-left-radius: 50% 5%;
  border-bottom-right-radius: 50% 5%;

  ${({ theme }) => theme.mediaQueries.xl} {
    height: 90%;
  }
`

const StyledImage = styled.img`
  max-width: 100%;
  height: auto;
  transition: 0.5s;
`

const StyleBlog = styled(Flex)`
  max-width: 100%;
  flex-direction: column;
  ${({ theme }) => theme.mediaQueries.xl} {
    flex-direction: row;
    gap: 25px;
  }
`

const StyledTagGroup = styled(Flex)`
  flex-wrap: wrap;

  ${Text} {
    &:after {
      content: ',';
      margin: 0 4px;
    }

    &:last-child {
      &:after {
        content: '';
      }
    }
  }
`

const NewBlog = () => {
  const { t } = useTranslation()
  const { data: articlesData } = useQuery<ArticleDataType[]>({
    queryKey: ['/latestArticles'],
    enabled: false,
  })
  const article = useMemo(() => articlesData?.[0], [articlesData])

  return (
    <StyledBackground>
      <StyledGradientBg />
      <Box maxWidth="1137px" margin="auto">
        <Flex flexDirection={['column', 'column', 'column', 'row']}>
          <Box>
            <Text bold fontSize={['32px', '32px', '40px']}>
              {t('Blog')}
            </Text>
            <Text bold mt="4px" mb={['20px', '20px', '35px']} color="textSubtle" fontSize={['14px', '14px', '16px']}>
              {t('Latest News about PancakeSwap and more!')}
            </Text>
          </Box>
        </Flex>
        <NextLink passHref href={`/articles/${article?.slug}`}>
          <Card>
            <StyleBlog>
              <Flex overflow="hidden" borderRadius={8} flex="1.8">
                <StyledImage src={article?.imgUrl ?? ''} alt={article?.title ?? 'image'} />
              </Flex>
              <Flex
                overflow="hidden"
                flexDirection="column"
                width="100%"
                flex="2"
                padding={[
                  '0 16px 16px 16px',
                  '0 16px 16px 16px',
                  '0 20px 20px 20px',
                  '0 20px 20px 20px',
                  '0 20px 20px 20px',
                  '28px 28px 28px 0',
                ]}
                mt={['16px', '16px', '20px', '20px', '20px', '0']}
              >
                <Box mb="24px" display={['none', null, null, 'block']}>
                  <StyledTagGroup>
                    {article?.categories?.map((category: string) => (
                      <Text bold key={category} fontSize="12px" color="textSubtle" textTransform="uppercase">
                        {category}
                      </Text>
                    ))}
                  </StyledTagGroup>
                </Box>
                <StyledLineClamp
                  bold
                  ellipsis
                  line={2}
                  lineHeight={['1.5', '1.2']}
                  mb={['8px', '8px', '8px', '24px']}
                  fontSize={['16px', '24px', '24px', '24px', '24px', '48px']}
                >
                  {article?.title}
                </StyledLineClamp>
                <Text display={['none', 'none', 'none', 'block']} ellipsis mb="24px">
                  {article?.description}
                </Text>
                <Text fontSize={['12px', '12px', '14px']} color="textSubtle">
                  {article?.createAt}
                </Text>
              </Flex>
            </StyleBlog>
          </Card>
        </NextLink>
      </Box>
    </StyledBackground>
  )
}

export default NewBlog
