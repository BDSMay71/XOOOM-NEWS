import './globals.css';                     // <-- make sure this import is present
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
        <header className="site-header fixed">
          <div className="site-header__inner">
            <a className="site-brand" href="/">
              <img className="site-logo" src="/xooom.svg" alt="XOOOM" />
              <span className="site-title">XOOOM</span>
            </a>
          </div>
        </header>

        {/* Adds top spacing equal to header height so content is not hidden */}
        <div className="site-header-spacer" />

        <main className="site-main">
          {children}
        </main>
      </body>
    </html>
  );
}
