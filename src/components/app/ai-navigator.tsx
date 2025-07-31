
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { navigationAssistantAction, speechToTextAction } from "@/app/actions";
import type { NavigationAssistantOutput } from "@/ai/flows/navigation-assistant";
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
import { Loader } from "../ui/loader";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Search, Mic, StopCircle } from "lucide-react";

const formSchema = z.object({
  query: z.string().min(5, {
    message: "Please describe what you need in at least 5 characters.",
  }),
});

const featureMap: Record<string, string> = {
  "local-content": "Content Generator",
  "differentiated-content": "Worksheet Generator",
  "visual-aid": "Visual Aid",
  "reading-assessment": "Reading Assessment",
  "game-generator": "Game Generator",
  "lesson-planner": "Lesson Planner",
  "self-assessment": "Self Assessment",
};

export function AiNavigator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NavigationAssistantOutput | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  const handleAudioRecording = async () => {
    if (isRecording) {
      mediaRecorder?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        recorder.start();

        const audioChunks: BlobPart[] = [];
        recorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64data = reader.result as string;
            setIsTranscribing(true);
            try {
              const result = await speechToTextAction({
                audioDataUri: base64data,
              });
              if (result.transcription) {
                form.setValue("query", result.transcription, {
                  shouldValidate: true,
                });
                await onSubmit({ query: result.transcription });
              } else {
                toast({
                  variant: "destructive",
                  title: "Transcription failed",
                  description:
                    "Could not understand the audio. Please try again.",
                });
              }
            } catch (error) {
              console.error(error);
              toast({
                variant: "destructive",
                title: "Error transcribing audio",
                description: "An unexpected error occurred. Please try again.",
              });
            } finally {
              setIsTranscribing(false);
            }
          };
          stream.getTracks().forEach((track) => track.stop());
        };

        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        toast({
          variant: "destructive",
          title: "Microphone access denied",
          description:
            "Please allow microphone access in your browser settings to use this feature.",
        });
      }
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const res = await navigationAssistantAction({ query: values.query });
      setResult(res);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error contacting Sahayak",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full text-left">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="h-5 w-5 text-primary" />
          Sahayak
        </CardTitle>
        <CardDescription className="pt-1">
          Describe what you want to do, and I'll suggest the right tool.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Your Request</FormLabel>
                  <FormControl>
                    <div className="flex w-full items-center space-x-2">
                      <Input
                        type="text"
                        placeholder="e.g., 'make a game about fractions' or 'I need a test'"
                        {...field}
                        disabled={loading || isTranscribing || isRecording}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={loading || isTranscribing || isRecording}
                        className="bg-accent hover:bg-accent/90 shrink-0"
                      >
                        {loading ? <Loader /> : <Search />}
                        <span className="sr-only">Search</span>
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        onClick={handleAudioRecording}
                        disabled={loading || isTranscribing}
                        variant={isRecording ? "destructive" : "outline"}
                        className="shrink-0"
                      >
                        {isTranscribing ? (
                          <Loader />
                        ) : isRecording ? (
                          <StopCircle />
                        ) : (
                          <Mic />
                        )}
                        <span className="sr-only">
                          {isRecording
                            ? "Stop Recording"
                            : "Start Recording"}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        {(loading || isTranscribing) && !result && (
          <div className="mt-4 flex justify-center items-center">
            <div className="flex flex-col items-center gap-2">
              <Loader className="h-6 w-6" />
              <p className="text-muted-foreground text-sm">
                {isTranscribing
                  ? "Transcribing audio..."
                  : isRecording
                  ? "Recording..."
                  : "Thinking..."}
              </p>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-4">
            <Card className="bg-muted">
              <CardContent className="p-3">
                <p className="text-sm">{result.suggestion}</p>
                {result.target !== "unknown" && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Suggested feature:{" "}
                    <span className="font-semibold">
                      {featureMap[result.target] ?? result.target}
                    </span>
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
