import Link from "next/link";
import Image from "next/image";

export default function Brand() {
  return (
    <Link href="/" aria-label="Bota Home" className="flex items-center gap-2">
      <Image
        src="/logo-icon-and-wordmark.svg"
        alt="Bota"
        width={92}
        height={24}
        className="hidden sm:block"
        priority
      />
    </Link>
  );
}
