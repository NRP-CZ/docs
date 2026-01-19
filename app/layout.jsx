/* eslint-env node */
import { Footer, Layout, Link, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import Image from 'next/image'
import RequiredPublicity from  '../public/images/ENG_eu-msmt-eosc-loga-barevne-ochrana-zona-paticka-bg.svg'

export const metadata = {
  metadataBase: new URL('https://github.com/NRP-CZ/docs'),
  title: {
    template: '%s - NRP Invenio Docs'
  },
  description: 'NRP Invenio Documentation Site',
  docsRepositoryBase: 'https://github.com/NRP-CZ/docs/blob/main/',
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
          <b>NRP Invenio</b>{' '}
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
          footer={<Footer className='x:flex-col x:width-full x:items-center'>
            <Image src={RequiredPublicity} height={150} alt="Required publicity logos" />
            <p className="x:mt-md">MIT {new Date().getFullYear()} © <Link href="https://cesnet.cz"> CESNET a.l.e.</Link>. <span>&nbsp;Contact us at&nbsp;</span><Link href="mailto:cesnet-invenio@eosc.cz"> cesnet-invenio@eosc.cz</Link></p></Footer>}
          editLink="Edit this page on GitHub"
          docsRepositoryBase={metadata.docsRepositoryBase}
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          pageMap={pageMap}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}