import React from 'react'
import { Helmet } from 'react-helmet-async'

export default function SEO({ title, description }) {
  const siteTitle = 'DIVYAM – Accessible Learning Platform'
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle
  const desc = description || 'AI-powered inclusive education platform for visually impaired students.'

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  )
}
