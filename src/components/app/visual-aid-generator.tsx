
"use client";

import { useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { generateVisualAidAction } from "@/app/actions";
import type { GenerateVisualAidOutput } from "@/ai/flows/visual-aid-generation";
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
import { Image as ImageIcon } from "lucide-react";

const formSchema = z.object({
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
});

export function VisualAidGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateVisualAidOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const res = await generateVisualAidAction(values);
      setResult(res);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error generating visual aid",
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
          <ImageIcon className="h-6 w-6 text-primary" />
          Visual Aid Designer
        </CardTitle>
        <CardDescription>
          Generate simple line drawings or charts that can be easily replicated
          on a blackboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description of Visual Aid</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder=""
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Be as descriptive as possible for the best results.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent/90">
              {loading && <Loader className="mr-2" />}
              Generate Visual Aid
            </Button>
          </form>
        </Form>

        {!loading && !result && (
          <div className="mt-8 pt-8 border-t border-dashed flex flex-col items-center text-center">
            <Image
              src="https://placehold.co/400x300.png"
              alt="Illustration for Visual Aid Generator"
              width={400}
              height={300}
              className="rounded-lg mb-4"
              data-ai-hint="drawing chart"
            />
            <p className="text-muted-foreground">
              Describe the visual aid you need, and I'll generate an image for
              you.
            </p>
          </div>
        )}

        {loading && (
          <div className="mt-8 flex justify-center items-center">
            <div className="flex flex-col items-center gap-2">
              <Loader className="h-8 w-8" />
              <p className="text-muted-foreground">
                Drawing your visual aid...
              </p>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-8">
            <h3 className="text-xl font-bold font-headline mb-4">
              Generated Visual Aid
            </h3>
            <Card>
              <CardContent className="p-4 flex justify-center">
                <Image
                  src={result.visualAid.url}
                  alt={form.getValues("description")}
                  width={512}
                  height={512}
                  className="rounded-lg border shadow-md"
                  data-ai-hint="line drawing"
                />
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
