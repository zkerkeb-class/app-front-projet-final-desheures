import 'styles/globals.scss';
import 'styles/variables.scss';

import Head from 'next/head';
import Navbar from 'components/NavBar/page.js';
import Logo from '../../public/favicon.ico';

export const metadata = {
  title: 'DES HEURES',
  description: 'Customer Relation Management',
};

export default function RootLayout({ children }) {
  const connecté = true;

  return (
    <html lang="en">
      <Head>
        {/* Favicon */}
        <link rel="icon" href={Logo} type="image/x-icon" />
      </Head>
      <body>
        {connecté && <Navbar />}
        {children}
      </body>
    </html>
  );
}
