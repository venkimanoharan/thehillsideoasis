import Link from "next/link";
import LogoMark from "@/components/logo-mark";

type SiteFooterProps = {
  contactPhoneDisplay: string;
  contactAddressDisplay: string;
  facebookUrl: string;
  instagramUrl: string;
};

export default function SiteFooter({
  contactPhoneDisplay,
  contactAddressDisplay,
  facebookUrl,
  instagramUrl,
}: SiteFooterProps) {
  return (
    <footer className="mt-20 border-t border-[#304b3f] bg-[radial-gradient(circle_at_10%_0%,#294536,#162a21_48%,#102019_100%)] text-[#e7dcc9]">
      <div className="mx-auto grid w-full max-w-[90rem] gap-8 px-6 py-12 sm:grid-cols-2">
        <div>
          <div className="flex items-center gap-4">
            <LogoMark className="h-14 w-14 border-[#d8c1a8]/70" imageClassName="drop-shadow-xl" />
            <div>
              <p className="eyebrow text-[#d2b98d]">Signature Heritage Escape</p>
              <p className="font-display mt-2 text-3xl text-[#f9f2e6] sm:text-4xl">The HillSide Oasis</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-[#e7ddce]">{contactAddressDisplay}</p>
          <p className="text-sm text-[#e7ddce]">Phone: {contactPhoneDisplay}</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-[#cabda8]">
            Signature hospitality in the foothills of the Western Ghats with curated stays and private experiences.
          </p>
        </div>

        <div className="sm:text-right">
          <div className="flex gap-2 sm:justify-end">
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[#5d7467] px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] hover:border-[#d2b98d]"
            >
              Facebook
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[#5d7467] px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] hover:border-[#d2b98d]"
            >
              Instagram
            </a>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 sm:justify-end">
            <Link href="/" className="text-xs uppercase tracking-[0.11em] text-[#d7ccbc] hover:text-white">
              Home
            </Link>
            <Link href="/about" className="text-xs uppercase tracking-[0.11em] text-[#d7ccbc] hover:text-white">
              About
            </Link>
            <Link href="/stay" className="text-xs uppercase tracking-[0.11em] text-[#d7ccbc] hover:text-white">
              Stay
            </Link>
            <Link href="/activities" className="text-xs uppercase tracking-[0.11em] text-[#d7ccbc] hover:text-white">
              Activities
            </Link>
            <Link href="/gallery" className="text-xs uppercase tracking-[0.11em] text-[#d7ccbc] hover:text-white">
              Gallery
            </Link>
            <Link href="/contact" className="text-xs uppercase tracking-[0.11em] text-[#d7ccbc] hover:text-white">
              Contact
            </Link>
            <Link href="/booking" className="text-xs uppercase tracking-[0.11em] text-[#d7ccbc] hover:text-white">
              Booking
            </Link>
          </div>

          <p className="mt-5 text-xs uppercase tracking-[0.1em] text-[#9fb2a7]">&#169; 2026 The HillSide Oasis. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
