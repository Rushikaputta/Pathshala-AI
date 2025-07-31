
"use client";

import { useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  generateAssignmentAction,
  evaluateAssignmentAction,
} from "@/app/actions";
import type { GenerateAssignmentOutput } from "@/ai/flows/assignment-generator";
import type { EvaluateAssignmentOutput } from "@/ai/flows/assignment-evaluator";
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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ClipboardCheck } from "lucide-react";

const generateFormSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters." }),
  gradeLevel: z.string().min(1, { message: "Grade level is required." }),
});

const evaluateFormSchema = z.object({
  answer: z
    .string()
    .min(10, { message: "Answer must be at least 10 characters." }),
});

export function SelfAssessor() {
  const [generationLoading, setGenerationLoading] = useState(false);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [assignment, setAssignment] =
    useState<GenerateAssignmentOutput | null>(null);
  const [evaluation, setEvaluation] =
    useState<EvaluateAssignmentOutput | null>(null);
  const { toast } = useToast();

  const generateForm = useForm<z.infer<typeof generateFormSchema>>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: { topic: "", gradeLevel: "" },
  });

  const evaluateForm = useForm<z.infer<typeof evaluateFormSchema>>({
    resolver: zodResolver(evaluateFormSchema),
    defaultValues: { answer: "" },
  });

  async function onGenerateSubmit(values: z.infer<typeof generateFormSchema>) {
    setGenerationLoading(true);
    setAssignment(null);
    setEvaluation(null);
    evaluateForm.reset();
    try {
      const res = await generateAssignmentAction(values);
      setAssignment(res);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error generating assignment",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setGenerationLoading(false);
    }
  }

  async function onEvaluateSubmit(values: z.infer<typeof evaluateFormSchema>) {
    if (!assignment) return;
    setEvaluationLoading(true);
    setEvaluation(null);
    try {
      const res = await evaluateAssignmentAction({
        question: assignment.question,
        answer: values.answer,
      });
      setEvaluation(res);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error evaluating answer",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setEvaluationLoading(false);
    }
  }

  const resetFlow = () => {
    setAssignment(null);
    setEvaluation(null);
    generateForm.reset();
    evaluateForm.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-primary" />
          Self-Assessment Tool
        </CardTitle>
        <CardDescription>
          Generate a practice question, answer it, and get instant AI feedback.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {!assignment ? (
          <div>
            <Form {...generateForm}>
              <form
                onSubmit={generateForm.handleSubmit(onGenerateSubmit)}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={generateForm.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={generateForm.control}
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
                <Button
                  type="submit"
                  disabled={generationLoading}
                  className="bg-accent hover:bg-accent/90"
                >
                  {generationLoading && <Loader className="mr-2" />}
                  Generate Assignment
                </Button>
              </form>
            </Form>
            {!generationLoading && (
               <div className="mt-8 pt-8 border-t border-dashed flex flex-col items-center text-center">
                <Image
                  src="https://placehold.co/400x300.png"
                  alt="Illustration for Self Assessment"
                  width={400}
                  height={300}
                  className="rounded-lg mb-4"
                  data-ai-hint="student exam"
                />
                <p className="text-muted-foreground">
                  Generate a question on any topic for a self-assessment
                  exercise.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="space-y-4">
              <h3 className="font-semibold">Your assignment question:</h3>
              <Card className="bg-muted">
                <CardContent className="p-4">
                  <p className="text-lg font-medium">{assignment.question}</p>
                </CardContent>
              </Card>

              <Separator className="my-6" />

              <Form {...evaluateForm}>
                <form
                  onSubmit={evaluateForm.handleSubmit(onEvaluateSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={evaluateForm.control}
                    name="answer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Answer</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={5}
                            placeholder="Write your answer here..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Try to answer in a few sentences.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center gap-4">
                    <Button type="submit" disabled={evaluationLoading}>
                      {evaluationLoading && <Loader className="mr-2" />}
                      Evaluate My Answer
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetFlow}
                    >
                      Start Over
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        )}

        {generationLoading && (
          <div className="flex justify-center items-center">
            <div className="flex flex-col items-center gap-2">
              <Loader className="h-8 w-8" />
              <p className="text-muted-foreground">
                Generating your question...
              </p>
            </div>
          </div>
        )}

        {evaluationLoading && (
          <div className="mt-8 flex justify-center items-center">
            <div className="flex flex-col items-center gap-2">
              <Loader className="h-8 w-8" />
              <p className="text-muted-foreground">Evaluating your answer...</p>
            </div>
          </div>
        )}

        {evaluation && (
          <div className="mt-8 space-y-6 border-t pt-8">
            <h3 className="text-xl font-bold font-headline mb-4">
              Evaluation Result
            </h3>
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap justify-around text-center gap-4">
                  <div
                    className={cn(
                      "p-4 rounded-lg transition-all text-center",
                      evaluation.score === "Excellent"
                        ? "bg-accent/10 border-2 border-accent scale-110"
                        : "opacity-40"
                    )}
                  >
                    <span className="text-5xl">🏆</span>
                    <p className="font-semibold mt-2">Excellent</p>
                  </div>
                  <div
                    className={cn(
                      "p-4 rounded-lg transition-all text-center",
                      evaluation.score === "Good"
                        ? "bg-primary/10 border-2 border-primary scale-110"
                        : "opacity-40"
                    )}
                  >
                    <span className="text-5xl">😄</span>
                    <p className="font-semibold mt-2">Good</p>
                  </div>
                   <div
                    className={cn(
                      "p-4 rounded-lg transition-all text-center",
                      evaluation.score === "Average"
                        ? "bg-chart-4/10 border-2 border-chart-4 scale-110"
                        : "opacity-40"
                    )}
                  >
                    <span className="text-5xl">🙂</span>
                    <p className="font-semibold mt-2">Average</p>
                  </div>
                  <div
                    className={cn(
                      "p-4 rounded-lg transition-all text-center",
                      evaluation.score === "Poor"
                        ? "bg-secondary border-2 border-secondary-foreground scale-110"
                        : "opacity-40"
                    )}
                  >
                    <span className="text-5xl">😐</span>
                    <p className="font-semibold mt-2">Poor</p>
                  </div>
                  <div
                    className={cn(
                      "p-4 rounded-lg transition-all text-center",
                      evaluation.score === "Bad"
                        ? "bg-destructive/10 border-2 border-destructive scale-110"
                        : "opacity-40"
                    )}
                  >
                    <span className="text-5xl">😞</span>
                    <p className="font-semibold mt-2">Bad</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Suggestions for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{evaluation.feedback}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
