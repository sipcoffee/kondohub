import { Navbar } from "@/components/layout/navbar";
import { TenantSubNav } from "@/components/layout/tenant-subnav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <TenantSubNav />
      <main className="flex-1 mx-auto w-full max-w-7xl px-5 md:px-8 py-8 md:py-10">
        {children}
      </main>
    </>
  );
}
