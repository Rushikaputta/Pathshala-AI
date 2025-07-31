'use server';
/**
 * @fileOverview Generates culturally relevant stories for students.
 *
 * - generateStory - A function that handles story generation.
 * - GenerateStoryInput - The input type for generateStory.
 * - GenerateStoryOutput - The return type for generateStory.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateStoryInputSchema = z.object({
  topic: z.string().describe('The topic or moral for the story.'),
  gradeLevel: z.string().describe('The target grade level for the story.'),
  language: z.string().describe('The language for the story (e.g., "English", "Marathi").'),
});
export type GenerateStoryInput = z.infer<typeof GenerateStoryInputSchema>;

const GenerateStoryOutputSchema = z.object({
  title: z.string().describe('A creative title for the story.'),
  story: z.string().describe('The generated story.'),
  imageUrl: z.string().optional().describe('URL of a relevant, colorful image for the story.'),
});
export type GenerateStoryOutput = z.infer<typeof GenerateStoryOutputSchema>;

export async function generateStory(input: GenerateStoryInput): Promise<GenerateStoryOutput> {
  return generateStoryFlow(input);
}

const storyPrompt = ai.definePrompt({
  name: 'generateStoryPrompt',
  input: {schema: GenerateStoryInputSchema},
  output: {schema: z.object({ title: z.string(), story: z.string() })},
  prompt: `You are a creative storyteller for children in India.

  Create a short, engaging, and culturally relevant story based on the following criteria:
  - The story must be educational and related to the specified topic or have a clear moral.
  - It should be suitable for the given grade level.
  - The language and characters should feel authentic to a diverse, multilingual Indian context.
  - The output must be in the specified language.

  Topic: {{{topic}}}
  Grade Level: {{{gradeLevel}}}
  Language: {{{language}}}
  `,
});

const generateStoryFlow = ai.defineFlow(
  {
    name: 'generateStoryFlow',
    inputSchema: GenerateStoryInputSchema,
    outputSchema: GenerateStoryOutputSchema,
    retries: 3,
    backoff: { delay: 500, multiplier: 2 },
  },
  async input => {
    const { output: storyOutput } = await storyPrompt(input);
    if (!storyOutput) {
      throw new Error("Failed to generate story text.");
    }
    
    try {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `A vibrant, colorful, and simple educational illustration for a child, for a story about "${input.topic}". The style should be clear, friendly, and culturally relevant for India.`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (media) {
        return {
          ...storyOutput,
          imageUrl: media.url,
        };
      }
    } catch (error) {
      console.error("Image generation failed, returning only text:", error);
    }
    
    return {
      ...storyOutput,
    };
  }
);
