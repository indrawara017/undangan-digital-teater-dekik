import { FAQClient } from '@/app/(public)/faq/faq-client';
import { getGlobalConfig } from '@/lib/config';

export const revalidate = 0;

export const metadata = {
  title: 'FAQ & Kontak — Teater Dekik',
  description: 'Pertanyaan yang sering ditanyakan seputar pementasan, pembelian tiket, dan kontak Teater Dekik.',
};

export default async function FAQPage() {
  const config = await getGlobalConfig();
  return <FAQClient config={config} />;
}
