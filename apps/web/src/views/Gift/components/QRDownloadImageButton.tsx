import { useTranslation } from '@pancakeswap/localization'
import { Button } from '@pancakeswap/uikit'
import html2canvas from 'html2canvas'
import { useCallback, useEffect, useRef, useState } from 'react'

// implement QRDownloadImageButton with the following props:
// - html id of the element to download
// only support download from DOM reference

interface QRDownloadImageButtonProps {
  elementId: string
  filename?: string
  children?: React.ReactNode
}

const QRDownloadImageButton: React.FC<QRDownloadImageButtonProps> = ({ elementId, filename = 'qr-code' }) => {
  const [isLoading, setIsLoading] = useState(false)
  const downloadInitiatedRef = useRef(false)

  const { t } = useTranslation()

  const downloadImage = useCallback(async () => {
    const element = document.getElementById(elementId)
    if (!element) {
      console.error(`Element with id "${elementId}" not found`)
      setIsLoading(false)
      return
    }

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: 'transparent', // transparent background
        scale: 2, // higher resolution
        logging: false, // disable console logs
        useCORS: true, // handle cross-origin images
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      })

      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a')
          link.download = `${filename}.png`
          link.href = URL.createObjectURL(blob)
          link.click()
          URL.revokeObjectURL(link.href)
        }
        setIsLoading(false)
        downloadInitiatedRef.current = false
      }, 'image/png')
    } catch (error) {
      console.error('Failed to capture element:', error)
      setIsLoading(false)
      downloadInitiatedRef.current = false
    }
  }, [elementId, filename])

  useEffect(() => {
    // ensure call downloadImage only once when isLoading is true
    if (isLoading && !downloadInitiatedRef.current) {
      downloadInitiatedRef.current = true
      // Use setTimeout to ensure loading state renders first before heavy operation
      // By doing this, the buttons will display the loading state quickly.
      // if we don't do this, the loading state will be displayed after the downloadImage is almost done..
      setTimeout(() => {
        downloadImage()
      }, 0)
    }
  }, [isLoading, downloadImage])

  return (
    <Button onClick={() => setIsLoading(true)} variant="danger" width="100%" disabled={isLoading} isLoading={isLoading}>
      {isLoading ? t('Downloading...') : t('Download')}
    </Button>
  )
}

export default QRDownloadImageButton
