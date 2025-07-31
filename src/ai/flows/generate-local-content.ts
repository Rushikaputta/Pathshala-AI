
'use server';

/**
 * @fileOverview Generates a short essay and a relevant image to explain a concept.
 *
 * - generateLocalContent - A function that generates an explanation and an image.
 * - GenerateLocalContentInput - The input type for the generateLocalContent function.
 * - GenerateLocalContentOutput - The return type for the generateLocalContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLocalContentInputSchema = z.object({
  concept: z.string().describe('The topic to explain (e.g., "water cycle", "photosynthesis").'),
  language: z.string().describe('The local language for the explanation (e.g., "Marathi", "Hindi").'),
});
export type GenerateLocalContentInput = z.infer<typeof GenerateLocalContentInputSchema>;


const GenerateLocalContentOutputSchema = z.object({
  explanation: z.string().describe('A short essay explaining the topic.'),
  imageUrl: z.string().optional().describe('URL of a relevant, colorful image for the concept.'),
});
export type GenerateLocalContentOutput = z.infer<typeof GenerateLocalContentOutputSchema>;

export async function generateLocalContent(input: GenerateLocalContentInput): Promise<GenerateLocalContentOutput> {
  return generateLocalContentFlow(input);
}

const explanationPrompt = ai.definePrompt({
  name: 'localContentExplanationPrompt',
  input: {schema: GenerateLocalContentInputSchema},
  output: {schema: z.object({ explanation: z.string() })},
  prompt: `You are a helpful teacher. Write a short, simple essay to explain the following concept to a student.
The essay should be in the specified language.

Concept: {{{concept}}}
Language: {{{language}}}
`,
});


const generateLocalContentFlow = ai.defineFlow(
  {
    name: 'generateLocalContentFlow',
    inputSchema: GenerateLocalContentInputSchema,
    outputSchema: GenerateLocalContentOutputSchema,
    retries: 3,
    backoff: { delay: 500, multiplier: 2 },
  },
  async (input) => {
    const { output: explanationOutput } = await explanationPrompt(input);
    if (!explanationOutput) {
      throw new Error("Failed to generate explanation.");
    }

    try {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `A vibrant, colorful, and simple educational illustration for a child, explaining the concept of "${input.concept}". The style should be clear and easy to understand.`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (media) {
        return {
          explanation: explanationOutput.explanation,
          imageUrl: media.url,
        };
      }
    } catch (error) {
      console.error("Image generation failed, returning only text:", error);
    }
    
    return {
      explanation: explanationOutput.explanation,
    };
  }
);
