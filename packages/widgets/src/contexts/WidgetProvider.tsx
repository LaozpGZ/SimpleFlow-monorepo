import { dark, light, UIKitProvider } from '@pancakeswap/uikit'
import { ReactNode } from 'react'

export const WidgetProvider = ({ children, theme = 'light' }: { children: ReactNode; theme?: 'light' | 'dark' }) => {
  return <UIKitProvider theme={theme === 'light' ? light : dark}>{children}</UIKitProvider>
}
