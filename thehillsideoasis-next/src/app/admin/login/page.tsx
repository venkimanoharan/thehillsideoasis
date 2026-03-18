import type { Metadata } from "next";
import AdminLoginForm from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Admin Login | The HillSide Oasis",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <main className="bg-background px-6 pb-16 pt-24 text-foreground">
      <section className="mx-auto max-w-lg rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9e3e12]">Admin</p>
        <h1 className="font-display mt-3 text-4xl text-zinc-900">Sign In</h1>
        <p className="mt-3 text-sm text-zinc-700">Use your admin credentials to maintain site content.</p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
