import '@/styles/globals.css'
import '@simpleflow/uikit/styles'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
