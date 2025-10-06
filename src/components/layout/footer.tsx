import { Mail, Phone } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-muted border-border border-t py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-muted-foreground text-center text-sm md:text-left">
            © 2025 Bota Review. All rights reserved.
          </div>

          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/privacy-policy"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              aria-label="Privacy Policy"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              aria-label="Terms of Service"
            >
              Terms of Service
            </Link>
            <div className="text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>support@bota.com</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>+251 (94) 121-9446</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
