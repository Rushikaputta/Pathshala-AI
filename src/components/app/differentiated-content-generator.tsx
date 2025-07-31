
"use client";

import { useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { generateDifferentiatedWorksheetAction } from "@/app/actions";
import type { GenerateDifferentiatedWorksheetOutput } from "@/ai/flows/differentiated-worksheet-generation";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Loader } from "../ui/loader";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Sheet } from "lucide-react";

const formSchema = z.object({
  textbookPageImage: z
    .string()
    .min(1, { message: "Please upload an image." }),
  gradeLevels: z
    .string()
    .min(1, { message: "Please enter at least one grade level." }),
});

export function DifferentiatedContentGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] =
    useState<GenerateDifferentiatedWorksheetOutput | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { textbookPageImage: "", gradeLevels: "" },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload an image smaller than 4MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultString = reader.result as string;
        setPreview(resultString);
        form.setValue("textbookPageImage", resultString, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const res = await generateDifferentiatedWorksheetAction(values);
      setResult(res);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error generating worksheets",
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
          <Sheet className="h-6 w-6 text-primary" />
          Worksheet Generator
        </CardTitle>
        <CardDescription>
          Upload a photo of a textbook page to instantly generate worksheets for
          different grade levels.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="textbookPageImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Textbook Page Image</FormLabel>
                    <FormControl>
                      <div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                         <label
                          htmlFor="file-upload"
                          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted"
                        >
                          {preview ? (
                            <Image
                              src={preview}
                              alt="Textbook page preview"
                              width={200}
                              height={192}
                              className="h-full w-auto object-contain rounded-lg"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground">PNG, JPG, GIF (MAX. 4MB)</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gradeLevels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade Levels</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter comma-separated grade levels for the worksheets.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={loading || !form.formState.isValid} className="bg-accent hover:bg-accent/90">
              {loading && <Loader className="mr-2" />}
              Generate Worksheets
            </Button>
          </form>
        </Form>

        {!loading && !result && (
          <div className="mt-8 pt-8 border-t border-dashed flex flex-col items-center text-center">
            <Image
              src="https://placehold.co/400x300.png"
              alt="Illustration for Worksheet Generator"
              width={400}
              height={300}
              className="rounded-lg mb-4"
              data-ai-hint="worksheet education"
            />
            <p className="text-muted-foreground">
              Fill out the form and upload an image to generate differentiated
              worksheets.
            </p>
          </div>
        )}

        {loading && (
           <div className="mt-8 flex justify-center items-center">
            <div className="flex flex-col items-center gap-2">
              <Loader className="h-8 w-8" />
              <p className="text-muted-foreground">
                Generating worksheets... this may take a moment.
              </p>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-8">
            <h3 className="text-xl font-bold font-headline mb-4">
              Generated Worksheets
            </h3>
            <Accordion
              type="single"
              collapsible
              defaultValue="item-0"
              className="w-full"
            >
              {result.worksheets.map((ws, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg">
                    Grade Level: {ws.gradeLevel}
                  </AccordionTrigger>
                  <AccordionContent>
                    <Tabs defaultValue="worksheet" className="w-full">
                      <TabsList>
                        <TabsTrigger value="worksheet">Worksheet</TabsTrigger>
                        <TabsTrigger value="answers">Keysheet</TabsTrigger>
                      </TabsList>
                      <TabsContent value="worksheet">
                        <Card className="bg-background">
                          <CardContent className="p-6 font-code whitespace-pre-wrap">
                            {ws.worksheetContent}
                          </CardContent>
                        </Card>
                      </TabsContent>
                      <TabsContent value="answers">
                        <Card className="bg-background">
                          <CardContent className="p-6 font-code whitespace-pre-wrap">
                            {ws.answerKey}
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
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
