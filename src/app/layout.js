import './globals.css';
import Providers from './providers';
import BottomNav from '../components/BottomNav';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main className="pb-14">
            {children}
          </main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
