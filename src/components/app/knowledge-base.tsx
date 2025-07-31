
"use client";

import { useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { aiKnowledgeBaseAction } from "@/app/actions";
import type { AIKnowledgeBaseOutput } from "@/ai/flows/ai-knowledge-base";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader } from "../ui/loader";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, Workflow } from "lucide-react";

const formSchema = z.object({
  language: z
    .string()
    .min(2, { message: "Language must be at least 2 characters." }),
  question: z
    .string()
    .min(10, { message: "Question must be at least 10 characters." }),
});

export function KnowledgeBase() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIKnowledgeBaseOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { language: "", question: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const res = await aiKnowledgeBaseAction(values);
      setResult(res);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error getting explanation",
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
          <Lightbulb className="h-6 w-6 text-primary" />
          Instant Queries
        </CardTitle>
        <CardDescription>
          Get simple, accurate explanations for complex student questions in the
          local language.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student's Question</FormLabel>
                  <FormControl>
                    <Textarea placeholder="" {...field} />
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
                  <FormLabel>Language for Explanation</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent/90">
              {loading && <Loader className="mr-2" />}
              Get Explanation
            </Button>
          </form>
        </Form>

        {!loading && !result && (
          <div className="mt-8 pt-8 border-t border-dashed flex flex-col items-center text-center">
            <Image
              src="https://placehold.co/400x300.png"
              alt="Illustration for Instant Queries"
              width={400}
              height={300}
              className="rounded-lg mb-4"
              data-ai-hint="question answer"
            />
            <p className="text-muted-foreground">
              Ask a question to get a simple explanation and analogy.
            </p>
          </div>
        )}

        {loading && (
          <div className="mt-8 flex justify-center items-center">
            <div className="flex flex-col items-center gap-2">
              <Loader className="h-8 w-8" />
              <p className="text-muted-foreground">
                Thinking of a simple explanation...
              </p>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Lightbulb className="h-6 w-6 text-primary" />
                <CardTitle>Explanation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{result.explanation}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                 <Workflow className="h-6 w-6 text-accent" />
                <CardTitle>Analogy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{result.analogy}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
