import { useTranslation } from '@pancakeswap/localization'
import { Button, copyText, useToast } from '@pancakeswap/uikit'
import { useElementToCanvas } from 'hooks/useElementToCanvas'
import { useCallback } from 'react'
import { generateClaimLink } from '../utils/generateClaimLink'

interface QRShareImageButtonProps {
  elementId: string
  code: string
  filename?: string
}

const QRShareImageButton: React.FC<QRShareImageButtonProps> = ({ elementId, code, filename = 'qr-code' }) => {
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const { convertToCanvasWithLoading, isLoading } = useElementToCanvas({ filename })

  const handleLinkFallback = useCallback(() => {
    const claimLink = generateClaimLink({ code })
    const shareText = t('Scan the QR code to claim your gift! %link%', { link: claimLink })

    if (navigator.share) {
      navigator
        .share({
          title: t('Gift from PancakeSwap!'),
          text: shareText,
          url: claimLink,
        })
        .catch(() => {
          copyText(claimLink)
          toastSuccess(t('Link copied'), t('Share link copied to clipboard!'))
        })
    } else {
      copyText(claimLink)
      toastSuccess(t('Link copied'), t('Share link copied to clipboard!'))
    }
  }, [code, t, toastSuccess])

  const shareImage = useCallback(async () => {
    const blob = await convertToCanvasWithLoading(elementId)

    if (blob) {
      const shareData = {
        title: t('Gift from PancakeSwap!'),
        text: t('Scan the QR code to claim your gift! Code: %code%', { code }),
        files: [new File([blob], `${filename}.png`, { type: 'image/png' })],
      }

      // Check if Web Share API supports files
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData)
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            handleLinkFallback()
          }
        }
      } else {
        handleLinkFallback()
      }
    } else {
      handleLinkFallback()
    }
  }, [elementId, code, filename, convertToCanvasWithLoading, handleLinkFallback, t])

  return (
    <Button onClick={shareImage} variant="secondary" width="100%" disabled={isLoading} isLoading={isLoading}>
      {isLoading ? t('Sharing...') : t('Share')}
    </Button>
  )
}

export default QRShareImageButton
