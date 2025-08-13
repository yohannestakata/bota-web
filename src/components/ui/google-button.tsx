"use client";

type GoogleButtonProps = {
  onClick?: () => void | Promise<void>;
  text?: string;
  disabled?: boolean;
  className?: string;
};

export default function GoogleButton({
  onClick,
  text = "Continue with Google",
  disabled,
  className = "",
}: GoogleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-10 w-full items-center justify-center gap-3 rounded-md border border-[#dadce0] bg-white px-4 text-sm font-medium text-[#3c4043] transition hover:bg-[#f7f8f8] focus:ring-2 focus:ring-[#1a73e8] focus:ring-offset-2 focus:outline-none active:bg-[#efefef] disabled:opacity-60 ${className}`}
      aria-label={text}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 18 18"
        aria-hidden="true"
      >
        <path
          fill="#4285F4"
          d="M17.64 9.2045c0-.638-.057-1.251-.164-1.839H9v3.479h4.844c-.209 1.125-.842 2.078-1.79 2.717v2.258h2.898c1.695-1.563 2.688-3.864 2.688-6.615z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.468-.806 5.957-2.191l-2.898-2.258c-.806.54-1.836.864-3.059.864-2.352 0-4.342-1.588-5.055-3.72H.957v2.332A9 9 0 009 18z"
        />
        <path
          fill="#FBBC05"
          d="M3.945 10.695A5.41 5.41 0 013.652 9c0-.586.101-1.152.293-1.695V4.973H.957A9 9 0 000 9c0 1.45.348 2.82.957 4.027l2.988-2.332z"
        />
        <path
          fill="#EA4335"
          d="M9 3.579c1.32 0 2.507.454 3.438 1.346l2.578-2.578C13.462.806 11.43 0 9 0A9 9 0 00.957 4.973l2.988 2.332C4.658 5.173 6.648 3.579 9 3.579z"
        />
      </svg>
      <span>{text}</span>
    </button>
  );
}

