import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[#ead8cc] bg-[linear-gradient(150deg,#1a0804,#2e110a,#4a1d0b)] text-zinc-200">
      <div className="mx-auto grid w-full max-w-[84rem] gap-8 px-6 py-12 sm:grid-cols-2">
        <div>
          <p className="eyebrow text-orange-200">Luxury Nature Retreat</p>
          <p className="font-display mt-2 text-3xl text-white sm:text-4xl">The HillSide Oasis</p>
          <p className="mt-3 text-sm text-zinc-100">Pollachi, Tamil Nadu</p>
          <p className="text-sm text-zinc-100">Phone: +91 91503 60597</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-zinc-200">
            Signature hospitality in the foothills of the Western Ghats with curated stays and private experiences.
          </p>
        </div>

        <div className="sm:text-right">
          <div className="flex gap-2 sm:justify-end">
            <a
              href="https://facebook.com/thehillsideoasis"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-zinc-500/50 px-3 py-2 text-xs font-semibold hover:border-orange-300"
            >
              Facebook
            </a>
            <a
              href="https://instagram.com/thehillsideoasis"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-zinc-500/50 px-3 py-2 text-xs font-semibold hover:border-orange-300"
            >
              Instagram
            </a>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 sm:justify-end">
            <Link href="/" className="text-xs text-zinc-100 hover:text-white">
              Home
            </Link>
            <Link href="/about" className="text-xs text-zinc-100 hover:text-white">
              About
            </Link>
            <Link href="/stay" className="text-xs text-zinc-100 hover:text-white">
              Stay
            </Link>
            <Link href="/activities" className="text-xs text-zinc-100 hover:text-white">
              Activities
            </Link>
            <Link href="/gallery" className="text-xs text-zinc-100 hover:text-white">
              Gallery
            </Link>
            <Link href="/contact" className="text-xs text-zinc-100 hover:text-white">
              Contact
            </Link>
            <Link href="/booking" className="text-xs text-zinc-100 hover:text-white">
              Booking
            </Link>
          </div>

          <p className="mt-4 text-xs text-zinc-300">&#169; 2026 The HillSide Oasis. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
