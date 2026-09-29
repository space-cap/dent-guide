import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const clinicName = process.env.NEXT_PUBLIC_CLINIC_NAME || '예시치과';

export const metadata: Metadata = {
  title: `${clinicName} 가격 안내 MVP`,
  description: 'Next.js + Vercel + JSON 기반 치과 가격 질의응답 MVP',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
