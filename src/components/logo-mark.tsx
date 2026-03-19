import Image from "next/image";

type LogoMarkProps = {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export default function LogoMark({
  className = "h-11 w-11 sm:h-12 sm:w-12",
  imageClassName = "scale-[1.14]",
  priority = false,
}: LogoMarkProps) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-full border border-[#d8c1a8] bg-[#f4e9dc] shadow-[0_6px_18px_-10px_rgba(28,19,9,0.45)]",
        className,
      ].join(" ")}
    >
      <Image
        src="/images/logo.jpeg"
        alt="The HillSide Oasis logo"
        fill
        priority={priority}
        sizes="(max-width: 640px) 52px, 72px"
        className={["object-cover", imageClassName].join(" ")}
      />
    </div>
  );
}