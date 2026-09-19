import { PublicNavbar, PublicFooter } from '@/app/components/public';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-page text-content w-full max-w-full overflow-x-hidden">
      <PublicNavbar />
      <main className="flex-1 pt-16 w-full max-w-full overflow-x-hidden">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
