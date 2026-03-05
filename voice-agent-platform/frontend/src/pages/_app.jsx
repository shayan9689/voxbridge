import Head from 'next/head';
import '../styles/globals.css';
import { SettingsProvider } from '../context/SettingsContext';
import UserSettingsModal from '../components/settings/UserSettingsModal';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
      </Head>
      <SettingsProvider>
        <Component {...pageProps} />
        <UserSettingsModal />
      </SettingsProvider>
    </>
  );
}
