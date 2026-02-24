"use client";

import { Globe, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className="bg-secondary">
      <div className="mx-auto p-8">
        {/* Main footer content */}
        <div className="flex flex-col justify-between gap-10 lg:flex-row">
          {/* Left side - Logo and description */}
          <div className="max-w-xl space-y-6">
          <h3 className="text-blue-900 font-sans text-4xl font-semibold">
            Specus
          </h3>

            {/* Description */}
            <p className="text-muted-foreground text-sm leading-relaxed">
            Specus is a procurement intelligence platform that transforms tender data into macro insights, procurement profiling, integrity screening, and relationship mapping across countries.
            </p>
          </div>

          {/* Right side - Links */}
          <div className="flex flex-wrap gap-12 lg:gap-16">
            {/* Produk column */}
            <div>
              <h3 className="text-foreground mb-3 font-semibold">
                Products
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/blacklist"
                    className="text-muted-foreground hover:text-muted-foreground/80 text-sm font-medium transition-colors"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  >
                    Insights
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tender"
                    className="text-muted-foreground hover:text-muted-foreground/80 text-sm font-medium transition-colors"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  >
                    Profiling
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tender"
                    className="text-muted-foreground hover:text-muted-foreground/80 text-sm font-medium transition-colors"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  >
                    AML Screening
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 pt-6 sm:flex-row sm:items-center">
            <p className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} Specus. All right reserved.
          </p>
          </div>
      </div>
    </footer>
  );
}
