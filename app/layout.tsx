import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'XOOOM — News from the world to your street',
  description: 'Curated political, financial, business, sports, health, and culture headlines — plus local news.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="siteHeader">
          <div className="siteHeader__inner">
            <div className="siteHeader__brand">XOOOM</div>
            <div className="siteHeader__tagline">news from the world to your street</div>
          </div>
        </header>
        <div className="siteMain">{children}</div>
      </body>
    </html>
  );
}
