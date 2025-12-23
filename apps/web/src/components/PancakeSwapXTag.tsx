import { Flex, LogoIcon, Tag, TagProps, Text } from '@pancakeswap/uikit'

interface SimpleFlowXTagProps extends TagProps {
  logoWidth?: string
  fontSize?: string
}

export const PancakeSwapXTag = ({ logoWidth, fontSize, ...props }: SimpleFlowXTagProps) => {
  return (
    <Tag variant="success" style={{ width: 'fit-content' }} {...props}>
      <Flex>
        <LogoIcon width={logoWidth} />
        <Text ml="6px" color="white" fontSize={fontSize} bold>
          SimpleFlow X
        </Text>
      </Flex>
    </Tag>
  )
}
