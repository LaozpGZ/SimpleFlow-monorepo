import { LanguageProvider } from '@pancakeswap/localization'
import { DialogProvider, ModalProvider, UIKitProvider, dark, light } from '@pancakeswap/uikit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider as NextThemeProvider, useTheme as useNextTheme } from 'next-themes'
import { Wallet } from './Wallet'

const StyledUIKitProvider: React.FC<React.PropsWithChildren> = ({ children, ...props }) => {
  const { resolvedTheme } = useNextTheme()
  return (
    <UIKitProvider theme={resolvedTheme === 'dark' ? dark : light} {...props}>
      {children}
    </UIKitProvider>
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

const Providers: React.FC<React.PropsWithChildren<{ children: React.ReactNode }>> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <NextThemeProvider>
        <StyledUIKitProvider>
          <LanguageProvider>
            <Wallet>
              <ModalProvider portalProvider={DialogProvider}>{children}</ModalProvider>
            </Wallet>
          </LanguageProvider>
        </StyledUIKitProvider>
      </NextThemeProvider>
    </QueryClientProvider>
  )
}

export default Providers
