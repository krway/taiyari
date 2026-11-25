import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'TAIYARI | Your Preparation. Your Future.', description: 'Prepare for Indian competitive exams.' };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
 return <html lang="en"><body>{children}</body></html>;
}
