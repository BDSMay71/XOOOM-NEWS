import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'XOOOM — Global & Local News',
  description: 'XOOOM curates top political, financial, business, and sports headlines plus local news by IP.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="site-header">
          <div className="site-header__inner">
            <a className="site-brand" href="/">
              <img className="site-logo" src="/xooom.svg" alt="XOOOM" />
              <span className="site-title">XOOOM</span>
            </a>
            {/* Optional right-side actions: add buttons/links here */}
          </div>
        </header>
        <main className="site-main">
          {children}
        </main>
      </body>
    </html>
  );
}
