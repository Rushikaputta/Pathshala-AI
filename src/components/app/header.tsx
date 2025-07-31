
'use client';

import { BookHeart } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b bg-card/50 shadow-sm">
      <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-4 cursor-pointer">
              <div className="p-2 bg-primary/20 rounded-lg">
                <BookHeart className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-headline text-primary">
                  Pathshala AI
                </h1>
                <p className="text-sm text-muted-foreground">
                  Your AI-powered teaching assistant for the multi-grade
                  classroom.
                </p>
              </div>
          </Link>
          <div className="flex items-center gap-2">
             <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
