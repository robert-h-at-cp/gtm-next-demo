import { useEffect } from 'react';
import { useSession } from "next-auth/client"

export default function GtmWrapper(props) {
  const [session, loadingSession] = useSession();

  useEffect(() => {
    if (loadingSession) { return; }
    let tagManagerArgs = {
      event: 'VirtualPageView',
      userType: 'guest',
      pageType: props.dataLayerPageType || 'unknown',
      ...(props.dataLayerRest || {}),
    }
    if (session) {
      tagManagerArgs.dataLayer.userType = 'user';
      tagManagerArgs.dataLayer.userId = session.user.id;
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(function() {
      this.reset();
    })
    window.dataLayer.push(tagManagerArgs);
  }, [loadingSession, session, props.dataLayerPageType, props.dataLayerRest]);

  return props.children;
}
