/* eslint-env node */
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export const metadata = {
  metadataBase: new URL('https://github.com/NRP-CZ/docs'),
  title: {
    template: '%s - NRP Docs'
  },
  description: 'NRP Documentation',
  docsRepositoryBase: 'https://github.com/NRP-CZ/docs',
  footer: {
    text: 'CESNET z.s.p.o. 2024',
  },
  applicationName: 'Nextra',
  generator: 'Next.js',
  appleWebApp: {
    title: 'Nextra'
  },
  other: {
    'msapplication-TileImage': '/ms-icon-144x144.png',
    'msapplication-TileColor': '#fff'
  },
  twitter: {
    site: 'https://github.com/NRP-CZ/docs'
  }
}

export default async function RootLayout({ children }) {
  const navbar = (
    <Navbar
      logo={
        <div>
          <b>NRP</b>{' '}
          <span style={{ opacity: '60%' }}>Documentation</span>
        </div>
      }
    />
  )
  const pageMap = await getPageMap()
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head faviconGlyph="✦" />
      <body>
        <Layout
          navbar={navbar}
          footer={<Footer>MIT {new Date().getFullYear()} © CESNET.</Footer>}
          editLink="Edit this page on GitHub"
          docsRepositoryBase="https://github.com/NRP-CZ/docs"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          pageMap={pageMap}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}