import './globals.css';
import { Noto_Sans_Gujarati, Plus_Jakarta_Sans } from 'next/font/google';
import { AppProvider } from '@/context/AppContext';
import StickyHeader from '@/components/StickyHeader';
import BottomNavBar from '@/components/BottomNavBar';
import GlobalModals from '@/components/GlobalModals';

const notoSansGujarati = Noto_Sans_Gujarati({
  subsets: ['gujarati'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-gujarati',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata = {
  title: 'ગુણગ્રહણ એપ | Gunagrahan WebApp',
  description: 'રમતોત્સવ ૨૦૨૬ — ગુણગ્રહણ મહોત્સવ: ગુણના ભિખારી બનીએ',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563EB',
};

export default function RootLayout({ children }) {
  return (
    <html lang="gu" className={`${notoSansGujarati.variable} ${plusJakartaSans.variable}`}>
      <body className="min-h-screen antialiased selection:bg-blue-200 selection:text-blue-900 bg-[#F8FAFC]">
        <AppProvider>
          <div className="min-h-screen flex flex-col font-sans">
            <StickyHeader />
            <div className="flex-1 pb-20 md:pb-8">
              {children}
            </div>
            <BottomNavBar />
            <GlobalModals />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
