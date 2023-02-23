## Example implementation of inserting our GTM tag into Nextjs projects

This is the demo nextjs project with bare minimum configuration to showcase the GTM setup.

*You may choose to use a different implementation. Such as using a package like `react-gtm-module`; Or other alternative approaches described in [this blog post](https://morganfeeney.com/how-to/integrate-google-tag-manager-with-next-js#fire-a-custom-event-when-a-page-changes)*


### 1. Insert the GTM script

Add the following code into `pages/_app.js`

```jsx
// ...
import Script from 'next/script'

export default function App({ Component, pageProps }) {
  // ...

  return (
    <>
      // ...
      
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-KX5QJ9T');
        `}
      </Script>

      // ...

      <Component {...pageProps} />
      
      // ...
    </>
  )
}
```

### 2. Create a GTM wrapper component that controls the GTM behavior app-wide

Create a file `/components/gtmWrapper.js` with the following content

```jsx
import { useEffect } from 'react';
import { useSession } from "next-auth/client"

export default function GtmWrapper(props) {
  const [session, loadingSession] = useSession();

  useEffect(() => {
    if (loadingSession) { return; }                    // do nothing unless the needed data is ready

    let tagManagerArgs = {
      event: 'VirtualPageView',                        // !required! the custom pageview event
      userType: 'guest',                               // (optional) the default user type
      pageType: props.dataLayerPageType || 'unknown',  // !required! the type of page on which the pageview is made
      ...(props.dataLayerRest || {}),                  // (optional) the rest of the custom data layer data
    }

    if (session) {                                     // overwrite the userType and userId if has logged in
      tagManagerArgs.dataLayer.userType = 'user';
      tagManagerArgs.dataLayer.userId = session.user.id;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(tagManagerArgs);             // push the event into the GTM queue to trigger it
  }, [loadingSession, session, props.dataLayerPageType, props.dataLayerRest]);

  return props.children;
}
```

### 3. Apply the wrapper to the entire app

Wrap the main app component with gtmWrapper in `/pages/_app.js`

```jsx
// ...
import GtmWrapper from '@/components/gtmWrapper'

export default function App({ Component, pageProps }) {
  return (
    <>
      // ...
      
      <GtmWrapper data-layer-page-type="unknown" data-layer-rest={null} {...pageProps}>
        <Component {...pageProps} />
      </GtmWrapper>
      
      // ...
    </>
  )
}

```

### 4. Pass pageType and other data to the DataLayer on each page that will load ads

Examples:

2.a `pages/index.js`

```jsx
// ...

export default function Home(props) {
  const [session, loadingSession] = useSession();

  // ...

  return (
    <>
      <div>
        <h1>Hello World</h1>
        ...
      </div>
    </>
  );
}

export async function getServerSideProps() {
  return { props: {
    dataLayerPageType: 'homepage',
  }}
}
```

2.b `pages/passage.js`

```babel
// ...

export default function Passage(props) {
  const [session, loadingSession] = useSession();
  const [dataLoaded, setDataLoaded] = useState(props.dataLoaded || false);
  const [data, setData] = useState(props.data || {});

  return (
    <>
      <div>
        <h1>Genesis</h1>
        <p>1 In the beginning God created the heavens and the earth. 2 Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters.</p>
        ...
      </div>
    </>
};

export async function getServerSideProps() {
  const res = await fetch(`https://.../data`)
  const data = await res.json()

  return { props: {
    data,
    dataLoaded: true,
    dataLayerPageType: 'passage',
    dataLayerRest: {
      bibleVersion: data.bibleVersion, // e.g. 'NIV'
      bibleBook: data.bibleBook, // e.g. 'Genesis'
      bibleChapter: data.bibleChapter, // e.g. 1
      keywords: data.keywords, // e.g. ['creation']
    }
  }}
}
```

*Note 1* Among all the info passed into `DataLayer`, only `pageType` is required. Everything else is optional but good to have so that the extra data can be used for optimizing ads targeting.

*Note 2* The example uses the `useEffect` hook to trigger the pageview event. If you choose to use other package or method to implement GTM, please make sure it will properly trigger the pageview event upon mounting/rendering the page comment or upon the router history change; And in addition, please make sure it will pass the correct `pageType` to DataLayer while triggering the pageview event.
