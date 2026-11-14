import { Helmet } from 'react-helmet-async'

/**
 * Injects Google AdSense script (with Auto Ads support) into document head
 */
export default function AdSenseScript({ settings }) {
  const isEnabled = settings?.adsense_enabled === '1' || settings?.adsense_enabled === true || settings?.adsense_enabled === 'true'
  const clientId = settings?.adsense_client_id?.trim()

  if (!isEnabled || !clientId) {
    return null
  }

  // Ensure format ca-pub-XXXXXXXXXXXXXX
  const formattedClient = clientId.startsWith('ca-pub-') ? clientId : `ca-pub-${clientId}`

  return (
    <Helmet>
      <script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${formattedClient}`}
        crossOrigin="anonymous"
      />
    </Helmet>
  )
}
