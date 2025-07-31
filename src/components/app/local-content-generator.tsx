
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  generateLocalContentAction,
  readAloudAction,
} from "@/app/actions";
import type { GenerateLocalContentOutput } from "@/ai/flows/generate-local-content";
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
import { BookText, Volume2, Pause } from "lucide-react";

const formSchema = z.object({
  concept: z
    .string()
    .min(5, { message: "Concept must be at least 5 characters." }),
  language: z
    .string()
    .min(2, { message: "Language must be at least 2 characters." }),
});

export function LocalContentGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateLocalContentOutput | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      concept: "",
      language: "",
    },
  });

   useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audioElement.addEventListener("play", handlePlay);
    audioElement.addEventListener("pause", handlePause);
    audioElement.addEventListener("ended", handleEnded);

    return () => {
      audioElement.removeEventListener("play", handlePlay);
      audioElement.removeEventListener("pause", handlePause);
      audioElement.removeEventListener("ended", handleEnded);
    };
  }, [audioRef]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    setAudioUrl(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    try {
      const res = await generateLocalContentAction(values);
      setResult(res);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error generating content",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleReadAloud = async () => {
    if (!result?.explanation) return;
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (audioUrl) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play().catch(e => console.error("Error playing audio:", e));
      }
      return;
    }

    setAudioLoading(true);
    try {
      const response = await readAloudAction({ text: result.explanation });
      setAudioUrl(response.audioUrl);
      audioElement.src = response.audioUrl;
      audioElement.play().catch(e => console.error("Error playing audio:", e));
    } catch (error) {
      console.error("Error generating audio:", error);
      toast({
        variant: "destructive",
        title: "Error generating audio",
        description: "Could not read the text aloud. Please try again.",
      });
    } finally {
      setAudioLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookText className="h-6 w-6 text-primary" />
          Content Generator
        </CardTitle>
        <CardDescription>
          Generate a short essay and a colorful image to explain complex
          concepts in a local language.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="concept"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic to Explain</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Water cycle, photosynthesis"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe the topic you want an essay on.
                  </FormDescription>
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
                    <Input placeholder="e.g. Marathi, Hindi" {...field} />
                  </FormControl>
                  <FormDescription>
                    The language for the generated essay.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-accent hover:bg-accent/90"
            >
              {loading && <Loader className="mr-2" />}
              Generate Content
            </Button>
          </form>
        </Form>
        <audio ref={audioRef} className="hidden" />

        {!loading && !result && (
          <div className="mt-8 pt-8 border-t border-dashed flex flex-col items-center text-center">
            <Image
              src="https://placehold.co/400x300.png"
              alt="Illustration for Content Generator"
              width={400}
              height={300}
              className="rounded-lg mb-4"
              data-ai-hint="writing essay"
            />
            <p className="text-muted-foreground">
              Describe a topic to generate a simple explanation and a colorful image.
            </p>
          </div>
        )}

        {loading && (
          <div className="mt-8 flex justify-center items-center">
            <div className="flex flex-col items-center gap-2">
              <Loader className="h-8 w-8" />
              <p className="text-muted-foreground">
                Generating your content... this may take a moment.
              </p>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-8">
            <h3 className="text-xl font-bold font-headline mb-4">
              Generated Content
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {result.imageUrl && (
                <div className="flex flex-col items-center gap-2">
                   <Image
                      src={result.imageUrl}
                      alt={form.getValues("concept")}
                      width={512}
                      height={512}
                      className="rounded-lg border shadow-md w-full"
                    />
                    <p className="text-sm text-muted-foreground">Generated Visual Aid</p>
                </div>
              )}
               <div className={result.imageUrl ? "" : "md:col-span-2"}>
                  {result.explanation && (
                    <Card className="bg-muted h-full">
                       <CardHeader className="flex flex-row justify-between items-center">
                          <CardTitle className="text-xl">Explanation</CardTitle>
                          <Button
                            onClick={handleReadAloud}
                            disabled={audioLoading}
                            size="icon"
                            variant="ghost"
                          >
                            {audioLoading ? <Loader /> : isPlaying ? <Pause /> : <Volume2 />}
                            <span className="sr-only">Read aloud</span>
                          </Button>
                        </CardHeader>
                      <CardContent className="whitespace-pre-wrap">
                        <p>{result.explanation}</p>
                      </CardContent>
                    </Card>
                  )}
               </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
