import Link from "next/link";
import { Building2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Building2 className="h-6 w-6" />
              <span className="font-bold text-xl">KondoHub</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Find your perfect condo stay. Daily, weekly, or monthly rentals
              made easy.
            </p>
          </div>

          {/* For Tenants */}
          <div>
            <h3 className="font-semibold mb-4">For Tenants</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/units" className="hover:text-foreground">
                  Browse Units
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-foreground">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h3 className="font-semibold mb-4">For Owners</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/signup" className="hover:text-foreground">
                  List Your Unit
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground">
                  Owner Guide
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} KondoHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
