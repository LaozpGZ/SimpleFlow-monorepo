import React from 'react'

interface ImageProps {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  unoptimized?: boolean
  [key: string]: any
}

const Image: React.FC<ImageProps> = ({ src, alt, width, height, ...props }) => {
  return <img src={src} alt={alt} width={width} height={height} {...props} />
}

export default Image
