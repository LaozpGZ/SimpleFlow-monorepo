import { useTranslation } from '@pancakeswap/localization'
import { Button } from '@pancakeswap/uikit'
import { useElementToCanvas } from 'hooks/useElementToCanvas'
import { useCallback, useEffect, useRef } from 'react'

interface QRDownloadImageButtonProps {
  elementId: string
  filename?: string
}

const QRDownloadImageButton: React.FC<QRDownloadImageButtonProps> = ({ elementId, filename = 'qr-code' }) => {
  const { t } = useTranslation()
  const downloadInitiatedRef = useRef(false)
  const { convertToCanvasWithLoading, isLoading } = useElementToCanvas({ filename })

  const downloadImage = useCallback(async () => {
    const blob = await convertToCanvasWithLoading(elementId)
    if (blob) {
      const link = document.createElement('a')
      link.download = `${filename}.png`
      link.href = URL.createObjectURL(blob)
      link.click()
      URL.revokeObjectURL(link.href)
    }
    downloadInitiatedRef.current = false
  }, [elementId, filename, convertToCanvasWithLoading])

  useEffect(() => {
    if (isLoading && !downloadInitiatedRef.current) {
      downloadInitiatedRef.current = true
      setTimeout(() => {
        downloadImage()
      }, 0)
    }
  }, [isLoading, downloadImage])

  return (
    <Button
      onClick={() => !isLoading && downloadImage()}
      variant="danger"
      width="100%"
      disabled={isLoading}
      isLoading={isLoading}
    >
      {isLoading ? t('Downloading...') : t('Download')}
    </Button>
  )
}

export default QRDownloadImageButton
