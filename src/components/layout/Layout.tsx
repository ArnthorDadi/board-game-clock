import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={"flex min-h-[100svh] flex-1 flex-col gap-4 bg-background"}>
      <Navbar />
      <main className={"container mx-auto flex flex-1 px-6 sm:px-0"}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
