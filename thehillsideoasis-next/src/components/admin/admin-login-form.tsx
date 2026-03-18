"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      username: String(formData.get("username") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setError("Invalid username or password.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Unable to sign in right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
      <label className="grid gap-2 text-sm font-semibold text-zinc-800">
        Username
        <input
          name="username"
          required
          className="rounded-xl border border-zinc-300 px-3 py-2"
          autoComplete="username"
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-zinc-800">
        Password
        <input
          name="password"
          type="password"
          required
          className="rounded-xl border border-zinc-300 px-3 py-2"
          autoComplete="current-password"
        />
      </label>

      {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-[#c45e2a] px-5 py-3 text-sm font-bold text-white hover:bg-[#9e3e12] disabled:cursor-not-allowed disabled:bg-zinc-400"
      >
        {submitting ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
}
