import { Navbar } from "@/components/layout/navbar";
import { AdminSubNav } from "@/components/layout/admin-subnav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <AdminSubNav />
      <main className="flex-1 mx-auto w-full max-w-7xl px-5 md:px-8 py-8 md:py-10">
        {children}
      </main>
    </>
  );
}
