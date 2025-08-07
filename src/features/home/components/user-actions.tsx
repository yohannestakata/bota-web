import Link from "next/link";

export default function UserActions() {
  return (
    <ul className="flex items-center gap-8">
      <li>
        <Link href="/">Add a place</Link>
      </li>
      <li>
        <Link href="/">Sign in</Link>
      </li>
    </ul>
  );
}
