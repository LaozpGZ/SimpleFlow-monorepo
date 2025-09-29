import React from 'react'

interface LinkProps {
  href: string
  children: React.ReactNode
  [key: string]: any
}

const Link: React.FC<LinkProps> = ({ href, children, ...props }) => {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  )
}

export default Link
