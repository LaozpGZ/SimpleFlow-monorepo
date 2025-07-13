import html2canvas from 'html2canvas'
import { useCallback, useState } from 'react'

interface UseElementToCanvasOptions {
  backgroundColor?: string
  scale?: number
  filename?: string
}

export const useElementToCanvas = (options: UseElementToCanvasOptions = {}) => {
  const { backgroundColor = 'transparent', scale = 2, filename = 'qr-code' } = options
  const [isLoading, setIsLoading] = useState(false)

  const convertToCanvas = useCallback(
    async (elementId: string): Promise<Blob | null> => {
      const element = document.getElementById(elementId)
      if (!element) {
        console.error(`Element with id "${elementId}" not found`)
        return null
      }

      try {
        const canvas = await html2canvas(element, {
          backgroundColor,
          scale,
          logging: false,
          useCORS: true,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
        })

        return new Promise((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob)
          }, 'image/png')
        })
      } catch (error) {
        console.error('Failed to capture element:', error)
        return null
      }
    },
    [backgroundColor, scale],
  )

  const convertToCanvasWithLoading = useCallback(
    async (elementId: string): Promise<Blob | null> => {
      setIsLoading(true)
      const blob = await convertToCanvas(elementId)
      setIsLoading(false)
      return blob
    },
    [convertToCanvas],
  )

  return {
    convertToCanvas,
    convertToCanvasWithLoading,
    isLoading,
    filename,
  }
}
