import { Clock, Flame, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";

export default function NavigationMenu() {
  return (
    <ul className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-8">
      <li className="flex items-center gap-2 font-medium underline decoration-3 underline-offset-8">
        <Link href="/" className="flex items-center gap-2">
          <span>
            <MapPin className="size-5" strokeWidth={2} />
          </span>
          Nearby
        </Link>
      </li>
      <li className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <span>
            <Flame className="size-5" strokeWidth={2} />
          </span>
          Popular
        </Link>
      </li>
      <li className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <span>
            <Sparkles className="size-5" strokeWidth={2} />
          </span>
          New
        </Link>
      </li>
      <li className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <span>
            <Clock className="size-5" strokeWidth={2} />
          </span>
          Open now
        </Link>
      </li>
    </ul>
  );
}
