import './globals.css';
import type { ReactNode } from 'react';
import NavBar from './components/NavBar';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata = {
  title: 'XOOOM — News from the world to your street',
  description: 'Curated local, political, financial, business, sports, health, and culture headlines.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="siteHeader">
          <div className="container siteHeader__inner">
            <div className="siteHeader__brand">XOOOM</div>
            <div className="siteHeader__tagline">news from the world to your street</div>
          </div>
        </header>

        <NavBar />

        <div className="siteMain">{children}</div>
      </body>
    </html>
  );
}
