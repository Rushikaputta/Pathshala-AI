
"use client";

import { useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { readingAssessmentAction } from "@/app/actions";
import type { ReadingAssessmentOutput } from "@/ai/flows/reading-assessment";
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
import { UploadCloud, Mic, Percent, ListTodo, MessageSquareQuote } from "lucide-react";

const formSchema = z.object({
  referenceText: z
    .string()
    .min(20, { message: "Reference text must be at least 20 characters." }),
  audioDataUri: z.string().min(1, { message: "Please upload an audio file." }),
  language: z.string().min(2, { message: "Please enter a language." }),
});

export function ReadingAssessor() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReadingAssessmentOutput | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      referenceText: "",
      audioDataUri: "",
      language: "",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit for audio
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload an audio file smaller than 10MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultString = reader.result as string;
        setAudioFileName(file.name);
        form.setValue("audioDataUri", resultString, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const res = await readingAssessmentAction(values);
      setResult(res);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error assessing reading",
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
          <Mic className="h-6 w-6 text-primary" />
          Reading Assessment
        </CardTitle>
        <CardDescription>
          Upload an audio recording of a student reading to get an AI-powered assessment of their performance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="referenceText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Text</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="audioDataUri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student's Audio Recording</FormLabel>
                    <FormControl>
                      <div>
                        <Input
                          type="file"
                          accept="audio/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="audio-upload"
                        />
                         <label
                          htmlFor="audio-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-center text-muted-foreground">
                              {audioFileName ? audioFileName : <><span className="font-semibold">Click to upload audio</span><br/>(MAX. 10MB)</>}
                            </p>
                          </div>
                        </label>
                      </div>
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
                    <FormDescription>
                      The language of the reference text.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="flex items-center gap-4">
              <Button type="submit" disabled={loading || !form.formState.isValid} className="bg-accent hover:bg-accent/90">
                {loading && <Loader className="mr-2" />}
                Assess Reading
              </Button>
               <Button type="button" variant="outline" disabled>
                <Mic className="mr-2"/>
                Record Audio (Coming Soon)
              </Button>
            </div>
          </form>
        </Form>

        {!loading && !result && (
          <div className="mt-8 pt-8 border-t border-dashed flex flex-col items-center text-center">
            <Image
              src="https://placehold.co/400x300.png"
              alt="Illustration for Reading Assessment"
              width={400}
              height={300}
              className="rounded-lg mb-4"
              data-ai-hint="child reading"
            />
            <p className="text-muted-foreground">
              Provide text and an audio recording to assess a student's reading
              skills.
            </p>
          </div>
        )}

        {loading && (
           <div className="mt-8 flex justify-center items-center">
            <div className="flex flex-col items-center gap-2">
              <Loader className="h-8 w-8" />
              <p className="text-muted-foreground">
                Analyzing audio... this may take a moment.
              </p>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            <h3 className="text-xl font-bold font-headline mb-4">
              Assessment Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Card>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                  <Percent className="h-6 w-6 text-primary" />
                  <CardTitle>Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{result.accuracy.toFixed(1)}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                   <Mic className="h-6 w-6 text-primary" />
                  <CardTitle>Fluency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl">{result.fluency}</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <ListTodo className="h-6 w-6 text-destructive" />
                <CardTitle>Mispronounced Words</CardTitle>
              </CardHeader>
              <CardContent>
                {result.mispronouncedWords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.mispronouncedWords.map((word, i) => <span key={i} className="bg-destructive/10 text-destructive font-mono px-2 py-1 rounded-md">{word}</span>)}
                  </div>
                ) : (
                  <p>No mispronounced words found. Great job!</p>
                )}
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                 <MessageSquareQuote className="h-6 w-6 text-accent" />
                <CardTitle>Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{result.feedback}</p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle>Transcribed Text</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground italic">"{result.transcribedText}"</p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
