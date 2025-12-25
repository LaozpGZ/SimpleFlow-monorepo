import { Flex, FlexProps, Link, Text, LinkProps } from '@simpleflow/uikit'
import { Trans } from '@simpleflow/l10n'

export const ChartByLabel = ({
  symbol,
  link,
  by,
  linkProps,
  ...props
}: { symbol: string; link: string; by: string; linkProps?: LinkProps } & FlexProps) => {
  return (
    <Flex alignItems="center" px="24px" {...props}>
      <Text fontSize="14px">
        <Trans
          i18nKey="%symbol% Chart by <0>%by%</0>"
          values={{ symbol, by }}
          components={[
            <Link ml="4px" style={{ display: 'inline' }} fontSize="14px" href={link} external {...linkProps} />,
          ]}
        />
      </Text>
    </Flex>
  )
}
