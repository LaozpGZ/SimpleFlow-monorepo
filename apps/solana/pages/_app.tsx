import { ResetCSS, ToastListener, type PancakeTheme } from '@pancakeswap/uikit'
import { Menu } from 'components/Menu'
import Providers from 'components/Providers'
import type { NextPage } from 'next'
import { DefaultSeo } from 'next-seo'
import { SEO } from 'next-seo.config'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import Script from 'next/script'
import { Fragment } from 'react'

declare module 'styled-components' {
  /* eslint-disable @typescript-eslint/no-empty-interface */
  export interface DefaultTheme extends PancakeTheme {}
}

function MyApp(props: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, minimum-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#1FC7D4" />
      </Head>
      {process.env.NEXT_PUBLIC_GTM_ID ? (
        <Script
          strategy="afterInteractive"
          id="google-tag"
          dangerouslySetInnerHTML={{
            __html: `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
`,
          }}
        />
      ) : null}
      <DefaultSeo {...SEO} />
      <Providers>
        <ResetCSS />
        <App {...props} />
      </Providers>

      <noscript>
        <iframe
          title="gtm"
          src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  )
}

type NextPageWithLayout = NextPage & {
  Layout?: React.FC<React.PropsWithChildren<unknown>>
  /** render component without all layouts */
  pure?: true
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
  if (Component.pure) {
    return <Component {...pageProps} />
  }

  // Use the layout defined at the page level, if available
  const Layout = Component.Layout || Fragment

  return (
    <>
      <Menu>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <ToastListener />
      </Menu>
    </>
  )
}

export default MyApp
