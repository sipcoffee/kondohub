import { Navbar } from "@/components/layout/navbar";
import { OwnerSubNav } from "@/components/layout/owner-subnav";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <OwnerSubNav />
      <main className="flex-1 mx-auto w-full max-w-7xl px-5 md:px-8 py-8 md:py-10">
        {children}
      </main>
    </>
  );
}
