
"use client";

import { useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { generateLessonPlanAction } from "@/app/actions";
import type { GenerateLessonPlanOutput } from "@/ai/flows/lesson-planner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader } from "../ui/loader";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays } from "lucide-react";

const formSchema = z.object({
  subject: z.string().min(3, { message: "Subject must be at least 3 characters." }),
  gradeLevel: z.string().min(1, { message: "Grade level is required." }),
  topic: z.string().min(5, { message: "Topic must be at least 5 characters." }),
  language: z.string().min(2, { message: "Language is required." }),
});

export function LessonPlanner() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateLessonPlanOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      gradeLevel: "",
      topic: "",
      language: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const res = await generateLessonPlanAction(values);
      setResult(res);
    } catch (error)
      {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error generating lesson plan",
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
          <CalendarDays className="h-6 w-6 text-primary" />
          Weekly Lesson Planner
        </CardTitle>
        <CardDescription>
          Generate a 5-day lesson plan for any topic, complete with activities and material lists.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            </div>
             <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weekly Topic</FormLabel>
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
            <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent/90">
              {loading && <Loader className="mr-2" />}
              Generate Lesson Plan
            </Button>
          </form>
        </Form>

        {!loading && !result && (
          <div className="mt-8 pt-8 border-t border-dashed flex flex-col items-center text-center">
            <Image
              src="https://placehold.co/400x300.png"
              alt="Illustration for Lesson Planner"
              width={400}
              height={300}
              className="rounded-lg mb-4"
              data-ai-hint="teacher planning"
            />
            <p className="text-muted-foreground">
              Fill out the form to generate a 5-day lesson plan.
            </p>
          </div>
        )}

        {loading && (
          <div className="mt-8 flex justify-center items-center">
            <div className="flex flex-col items-center gap-2">
              <Loader className="h-8 w-8" />
              <p className="text-muted-foreground">
                Building your weekly plan...
              </p>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-8">
            <h3 className="text-xl font-bold font-headline mb-4">
              Your 5-Day Lesson Plan
            </h3>
            <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
              {result.plan.map((day, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg">
                    {day.day}: {day.topic}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                       <p className="font-semibold">Activity:</p>
                       <p>{day.activity}</p>
                       <p className="font-semibold">Materials:</p>
                       <p>{day.materials}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
