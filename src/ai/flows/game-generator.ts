'use server';
/**
 * @fileOverview Generates educational games.
 *
 * - generateGame - A function that handles educational game generation.
 * - GenerateGameInput - The input type for the generateGame function.
 * - GenerateGameOutput - The return type for the generateGame function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateGameInputSchema = z.object({
  topic: z.string().describe('The educational topic for the game.'),
  gradeLevel: z.string().describe('The target grade level for the game.'),
  language: z.string().describe('The language for the game instructions (e.g., "English", "Marathi").'),
});
export type GenerateGameInput = z.infer<typeof GenerateGameInputSchema>;

const GenerateGameOutputSchema = z.object({
  name: z.string().describe('A creative name for the game.'),
  description: z.string().describe('A brief, engaging description of the game.'),
  rules: z.string().describe('The step-by-step rules to play the game.'),
  materials: z.string().describe('A list of simple materials needed for the game (e.g., "chalk", "stones", "paper").'),
});
export type GenerateGameOutput = z.infer<typeof GenerateGameOutputSchema>;

export async function generateGame(input: GenerateGameInput): Promise<GenerateGameOutput> {
  return generateGameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGamePrompt',
  input: {schema: GenerateGameInputSchema},
  output: {schema: GenerateGameOutputSchema},
  prompt: `You are a creative game designer specializing in fun, low-resource educational games for children in India.

  Create a game based on the following criteria:
  - The game must be educational and related to the specified topic.
  - It should be suitable for the given grade level.
  - The rules must be simple and easy to understand.
  - Required materials should be commonly available in a low-resource classroom or outdoors (e.g., chalk, stones, sticks, paper).
  - The output must be in the specified language.

  Topic: {{{topic}}}
  Grade Level: {{{gradeLevel}}}
  Language: {{{language}}}
  `,
});

const generateGameFlow = ai.defineFlow(
  {
    name: 'generateGameFlow',
    inputSchema: GenerateGameInputSchema,
    outputSchema: GenerateGameOutputSchema,
    retries: 3,
    backoff: { delay: 500, multiplier: 2 },
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
