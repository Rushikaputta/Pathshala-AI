
"use client";

import { useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { generateGameAction } from "@/app/actions";
import type { GenerateGameOutput } from "@/ai/flows/game-generator";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader } from "../ui/loader";
import { useToast } from "@/hooks/use-toast";
import { Paintbrush, Puzzle, ClipboardList } from "lucide-react";

const formSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters." }),
  gradeLevel: z.string().min(1, { message: "Grade level is required." }),
  language: z.string().min(2, { message: "Language is required." }),
});

export function GameGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateGameOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      gradeLevel: "",
      language: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const res = await generateGameAction(values);
      setResult(res);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error generating game",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Puzzle className="h-6 w-6 text-primary" />
          Educational Game Generator
        </CardTitle>
        <CardDescription>
          Instantly design a fun, low-resource educational game for any topic.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Educational Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="gradeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade Level</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent/90">
              {loading && <Loader className="mr-2" />}
              Generate Game
            </Button>
          </form>
        </Form>

        {!loading && !result && (
          <div className="mt-8 pt-8 border-t border-dashed flex flex-col items-center text-center">
            <Image
              src="https://placehold.co/400x300.png"
              alt="Illustration for Game Generator"
              width={400}
              height={300}
              className="rounded-lg mb-4"
              data-ai-hint="children playing"
            />
            <p className="text-muted-foreground">
              Describe a topic, and I'll invent a fun, low-resource game.
            </p>
          </div>
        )}

        {loading && (
          <div className="mt-8 flex justify-center items-center">
            <div className="flex flex-col items-center gap-2">
              <Loader className="h-8 w-8" />
              <p className="text-muted-foreground">
                Designing a fun game...
              </p>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold font-headline text-primary">{result.name}</h2>
              <p className="text-muted-foreground mt-2">{result.description}</p>
            </div>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Puzzle className="h-6 w-6 text-primary" />
                <CardTitle>How to Play (Rules)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{result.rules}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                 <Paintbrush className="h-6 w-6 text-accent" />
                <CardTitle>Materials Needed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{result.materials}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
