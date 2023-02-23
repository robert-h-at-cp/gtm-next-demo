import '@/styles/globals.css'
import Script from 'next/script'
import { Provider as NextAuthProvider } from "next-auth/client"
import GtmWrapper from '@/components/gtmWrapper'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-KX5QJ9T');
        `}
      </Script>
      <NextAuthProvider session={pageProps.session}>
        <GtmWrapper data-layer-page-type="unknown" data-layer-rest={null} {...pageProps}>
          <Component {...pageProps} />
        </GtmWrapper>
      </NextAuthProvider>
    </>
  )
}
