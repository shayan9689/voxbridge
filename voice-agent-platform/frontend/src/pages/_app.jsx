import '../styles/globals.css';
import { SettingsProvider } from '../context/SettingsContext';
import UserSettingsModal from '../components/settings/UserSettingsModal';

export default function App({ Component, pageProps }) {
  return (
    <SettingsProvider>
      <Component {...pageProps} />
      <UserSettingsModal />
    </SettingsProvider>
  );
}
