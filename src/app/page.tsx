
"use client";

import { Header } from "@/components/app/header";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col justify-center">
        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-accent opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
          <div className="max-w-3xl mx-auto py-32 sm:py-48 lg:py-56">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl font-headline">
                Your AI Teaching Assistant for the Modern Classroom
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Pathshala AI empowers teachers in multi-grade, low-resource
                environments with powerful tools to generate localized content,
                create differentiated worksheets, and instantly answer student
                queries.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button
                  asChild
                  size="lg"
                  className="bg-accent hover:bg-accent/90"
                >
                  <Link href="/dashboard">
                    Get Started
                    <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
