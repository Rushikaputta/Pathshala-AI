
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { generateStoryAction, readAloudAction } from "@/app/actions";
import type { GenerateStoryOutput } from "@/ai/flows/story-generator";
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
import { BookOpen, Volume2, Pause } from "lucide-react";

const formSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters." }),
  gradeLevel: z.string().min(1, { message: "Grade level is required." }),
  language: z.string().min(2, { message: "Language is required." }),
});

export function StoryGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateStoryOutput | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      gradeLevel: "",
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
      const res = await generateStoryAction(values);
      setResult(res);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error generating story",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleReadAloud = async () => {
    if (!result?.story) return;
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (audioUrl) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play().catch((e) => console.error("Error playing audio:", e));
      }
      return;
    }

    setAudioLoading(true);
    try {
      const response = await readAloudAction({ text: `${result.title}. ${result.story}` });
      setAudioUrl(response.audioUrl);
      audioElement.src = response.audioUrl;
      audioElement.play().catch((e) => console.error("Error playing audio:", e));
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
          <BookOpen className="h-6 w-6 text-primary" />
          Story Generator
        </CardTitle>
        <CardDescription>
          Generate a short, engaging, and culturally relevant story for your students.
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
                  <FormLabel>Story Topic or Moral</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Honesty is the best policy, The water cycle" {...field} />
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
                      <Input placeholder="e.g., 3rd Grade, Class 5" {...field} />
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
                      <Input placeholder="e.g., Hindi, English" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent/90">
              {loading && <Loader className="mr-2" />}
              Generate Story
            </Button>
          </form>
        </Form>
        <audio ref={audioRef} className="hidden" />

        {!loading && !result && (
          <div className="mt-8 pt-8 border-t border-dashed flex flex-col items-center text-center">
            <Image
              src="https://placehold.co/400x300.png"
              alt="Illustration for Story Generator"
              width={400}
              height={300}
              className="rounded-lg mb-4"
              data-ai-hint="storytelling book"
            />
            <p className="text-muted-foreground">
              Provide a topic and I'll write a story for your students.
            </p>
          </div>
        )}

        {loading && (
          <div className="mt-8 flex justify-center items-center">
            <div className="flex flex-col items-center gap-2">
              <Loader className="h-8 w-8" />
              <p className="text-muted-foreground">
                Writing a captivating story... this may take a moment.
              </p>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
             {result.imageUrl && (
                <div className="flex flex-col items-center gap-2">
                   <Image
                      src={result.imageUrl}
                      alt={form.getValues("topic")}
                      width={512}
                      height={512}
                      className="rounded-lg border shadow-md w-full"
                    />
                </div>
              )}
            <div>
              <div className="flex justify-between items-start">
                 <h2 className="text-3xl font-bold font-headline text-primary">{result.title}</h2>
                 <Button
                    onClick={handleReadAloud}
                    disabled={audioLoading}
                    size="icon"
                    variant="ghost"
                  >
                    {audioLoading ? <Loader /> : isPlaying ? <Pause /> : <Volume2 />}
                    <span className="sr-only">Read aloud</span>
                  </Button>
              </div>
              <Card className="bg-muted mt-2">
                <CardContent className="p-6">
                  <p className="whitespace-pre-wrap leading-relaxed">{result.story}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
