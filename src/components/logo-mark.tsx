import Image from "next/image";

type LogoMarkProps = {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export default function LogoMark({
  className = "h-11 w-11 sm:h-12 sm:w-12",
  imageClassName = "",
  priority = false,
}: LogoMarkProps) {
  return (
    <div
      className={[
        "relative",
        className,
      ].join(" ")}
    >
      <Image
        src="/images/logo.png"
        alt="The HillSide Oasis logo"
        fill
        priority={priority}
        sizes="(max-width: 640px) 52px, 72px"
        className={["object-contain drop-shadow-md", imageClassName].join(" ")}
      />
    </div>
  );
}