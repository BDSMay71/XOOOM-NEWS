export const metadata = {
  title: 'XOOOM — Global & Local News',
  description: 'XOOOM curates top political, financial, business, and sports headlines plus local news by IP.'
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
