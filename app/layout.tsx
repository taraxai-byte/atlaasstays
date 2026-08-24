import './globals.css';
import React from 'react';

export const metadata = {
  title: 'ATLMS Stays',
  description: 'ATLAAS Stays - Powered by Next.js'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        {children}
      </body>
    </html>
  );
}
