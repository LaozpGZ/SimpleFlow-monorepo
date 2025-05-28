import { Box, HStack, Text } from '@chakra-ui/react'
import LockPercentCircle from '@/components/LockPercentCircle'
import { FormattedPoolInfoItem } from '@/hooks/pool/type'

export const ColumnsPoolLiquidity: React.FC<{
  data: FormattedPoolInfoItem
  value: string
}> = ({ data, value }) => {
  return (
    <HStack justify="flex-end" gap={2}>
      <Text fontSize={['sm', 'lg']} textAlign="right">
        {value}
      </Text>
      <Box minWidth="22px">
        {Math.abs(data.burnPercent || 0) > 5 && (
          <LockPercentCircle
            value={Math.abs(data.burnPercent || 0)}
            circularProps={{
              size: '22px',
              thickness: '8px'
            }}
          />
        )}
      </Box>
    </HStack>
  )
}
