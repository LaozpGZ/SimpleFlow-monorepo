import { TonConnector } from 'components/connector/TonConnector'
import { Header } from 'components/Header'
import type { AppProps } from 'next/app'
import '../styles/globals.css' // Import global CSS

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <TonConnector>
      <>
        <Header />
        {/* Add a global layout or wrapper */}
        <Component {...pageProps} />
      </>
    </TonConnector>
  )
}

export default MyApp
