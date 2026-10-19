import Frame from '@/components/boutique/Frame';
import type { Metadata } from "next";
import { shop } from "@/lib/config";
import "./globals.css";
import "./store.css";
import "./demo.css";

import './boutique.css';

export const metadata: Metadata = {
  title: `${shop.name} · Hoa tươi cho những khoảnh khắc đẹp`,
  description: `Khám phá hoa tươi, đặt hoa và theo dõi đơn tại ${shop.name}.`,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body className={`theme-${shop.theme}`}><Frame>{children}</Frame></body></html>;
}
