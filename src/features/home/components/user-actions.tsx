import Link from "next/link";

export default function UserActions() {
  return (
    <ul className="flex items-center gap-8">
      <li>
        <Link href="/" className="font-medium">
          Sign in
        </Link>
      </li>
    </ul>
  );
}
