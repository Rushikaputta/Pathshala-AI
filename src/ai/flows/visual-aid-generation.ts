'use server';

/**
 * @fileOverview A visual aid generation AI agent.
 *
 * - generateVisualAid - A function that handles the visual aid generation process.
 * - GenerateVisualAidInput - The input type for the generateVisualAid function.
 * - GenerateVisualAidOutput - The return type for the generateVisualAid function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVisualAidInputSchema = z.object({
  description: z.string().describe('The description of the visual aid to generate.'),
});
export type GenerateVisualAidInput = z.infer<typeof GenerateVisualAidInputSchema>;

const GenerateVisualAidOutputSchema = z.object({
  visualAid: z.object({
    url: z.string().describe('The URL of the generated visual aid image.'),
  }),
});
export type GenerateVisualAidOutput = z.infer<typeof GenerateVisualAidOutputSchema>;

export async function generateVisualAid(input: GenerateVisualAidInput): Promise<GenerateVisualAidOutput> {
  return generateVisualAidFlow(input);
}

const prompt = ai.definePrompt({
  name: 'visualAidGenerationPrompt',
  input: {schema: GenerateVisualAidInputSchema},
  output: {schema: GenerateVisualAidOutputSchema},
  prompt: `You are an AI assistant that generates visual aids based on user descriptions.

  The user will provide a description of the visual aid they want to generate. You will generate an image based on that description.

  Description: {{{description}}}
  `, config: {
    responseModalities: ['TEXT', 'IMAGE'],
  }
});

const generateVisualAidFlow = ai.defineFlow(
  {
    name: 'generateVisualAidFlow',
    inputSchema: GenerateVisualAidInputSchema,
    outputSchema: GenerateVisualAidOutputSchema,
    retries: 3,
    backoff: { delay: 500, multiplier: 2 },
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: input.description,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media) {
      throw new Error('No media returned from image generation.');
    }

    return {visualAid: {url: media.url}};
  }
);
