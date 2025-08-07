import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
} from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-muted border-border border-t">
      <div className="container mx-auto px-24 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <h3 className="text-foreground mb-4 text-lg font-medium">Bota</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Discover the best places around you with authentic reviews from
              real people. Your trusted guide to amazing experiences.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-foreground mb-4 text-lg font-medium">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/reviews"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  All Reviews
                </Link>
              </li>
              <li>
                <Link
                  href="/places"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Popular Places
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-foreground mb-4 text-lg font-medium">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/report"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Report Issue
                </Link>
              </li>
              <li>
                <Link
                  href="/feedback"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Send Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-foreground mb-4 text-lg font-medium">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/guidelines"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-border mt-8 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-muted-foreground text-center text-sm md:text-left">
              © 2024 Bota. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@bota.com</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
