
"use client";

import { LocalContentGenerator } from "@/components/app/local-content-generator";
import { DifferentiatedContentGenerator } from "@/components/app/differentiated-content-generator";
import { VisualAidGenerator } from "@/components/app/visual-aid-generator";
import { ReadingAssessor } from "@/components/app/reading-assessor";
import { GameGenerator } from "@/components/app/game-generator";
import { LessonPlanner } from "@/components/app/lesson-planner";
import { SelfAssessor } from "@/components/app/self-assessor";
import { StoryGenerator } from "@/components/app/story-generator";
import { AiNavigator } from "@/components/app/ai-navigator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/app/header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
           <div>
            <h2 className="text-3xl font-bold font-headline">Teacher's Dashboard</h2>
            <p className="text-muted-foreground mt-1">
              All your AI-powered teaching tools in one place.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
        <Tabs defaultValue="local-content" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="local-content">Content Generator</TabsTrigger>
            <TabsTrigger value="story-generator">Story Generator</TabsTrigger>
            <TabsTrigger value="differentiated-content">
              Worksheet Generator
            </TabsTrigger>
            <TabsTrigger value="visual-aid">Visual Aid</TabsTrigger>
            <TabsTrigger value="reading-assessment">
              Reading Assessment
            </TabsTrigger>
            <TabsTrigger value="game-generator">Game Generator</TabsTrigger>
            <TabsTrigger value="lesson-planner">Lesson Planner</TabsTrigger>
            <TabsTrigger value="self-assessment">Self Assessment</TabsTrigger>
          </TabsList>

          <TabsContent value="local-content">
            <LocalContentGenerator />
          </TabsContent>
          <TabsContent value="story-generator">
            <StoryGenerator />
          </TabsContent>
          <TabsContent value="differentiated-content">
            <DifferentiatedContentGenerator />
          </TabsContent>
          <TabsContent value="visual-aid">
            <VisualAidGenerator />
          </TabsContent>
          <TabsContent value="reading-assessment">
            <ReadingAssessor />
          </TabsContent>
          <TabsContent value="game-generator">
            <GameGenerator />
          </TabsContent>
          <TabsContent value="lesson-planner">
            <LessonPlanner />
          </TabsContent>
          <TabsContent value="self-assessment">
            <SelfAssessor />
          </TabsContent>
        </Tabs>
        <Separator className="my-8" />
        <AiNavigator />
      </main>
    </div>
  );
}
