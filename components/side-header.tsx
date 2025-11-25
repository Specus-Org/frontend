'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Procure Lens</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/about"
              className="text-sm font-medium hover:text-muted-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/solutions"
              className="text-sm font-medium hover:text-muted-foreground transition-colors"
            >
              Solutions
            </Link>
            <Link
              href="/data-sources"
              className="text-sm font-medium hover:text-muted-foreground transition-colors"
            >
              Data Sources
            </Link>
            <Link
              href="/team"
              className="text-sm font-medium hover:text-muted-foreground transition-colors"
            >
              Team
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium hover:text-muted-foreground transition-colors"
            >
              Contact
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button size="sm">Get Started</Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-4 border-t">
            <Link href="/about" className="block text-sm font-medium hover:text-muted-foreground">
              About
            </Link>
            <Link
              href="/solutions"
              className="block text-sm font-medium hover:text-muted-foreground"
            >
              Solutions
            </Link>
            <Link
              href="/data-sources"
              className="block text-sm font-medium hover:text-muted-foreground"
            >
              Data Sources
            </Link>
            <Link href="/team" className="block text-sm font-medium hover:text-muted-foreground">
              Team
            </Link>
            <Link href="/contact" className="block text-sm font-medium hover:text-muted-foreground">
              Contact
            </Link>
            <div className="flex flex-col space-y-2 pt-4">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
              <Button size="sm">Get Started</Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
