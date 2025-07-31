'use server';
/**
 * @fileOverview An AI assistant to help users navigate the application features.
 *
 * - navigationAssistant - A function that handles user navigation queries.
 * - NavigationAssistantInput - The input type for the navigationAssistant function.
 * - NavigationAssistantOutput - The return type for the navigationAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const NavigationAssistantInputSchema = z.object({
  query: z.string().describe('The user query asking for help or a feature.'),
});
export type NavigationAssistantInput = z.infer<typeof NavigationAssistantInputSchema>;

const NavigationAssistantOutputSchema = z.object({
  suggestion: z.string().describe("A helpful message to the user suggesting a feature."),
  target: z.enum([
    'local-content',
    'differentiated-content',
    'visual-aid',
    'reading-assessment',
    'game-generator',
    'lesson-planner',
    'self-assessment',
    'unknown'
  ]).describe("The key of the feature to navigate to. Use 'unknown' if no feature matches.")
});
export type NavigationAssistantOutput = z.infer<typeof NavigationAssistantOutputSchema>;

export async function navigationAssistant(input: NavigationAssistantInput): Promise<NavigationAssistantOutput> {
  return navigationAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'navigationAssistantPrompt',
  input: {schema: NavigationAssistantInputSchema},
  output: {schema: NavigationAssistantOutputSchema},
  prompt: `You are a helpful navigation assistant for the Pathshala AI application.
  Your goal is to understand the user's request and guide them to the correct feature.

  Here are the available features and their keys:
  - 'Content Generator' (key: 'local-content'): Generate stories in a local language to explain concepts.
  - 'Worksheet Generator' (key: 'differentiated-content'): Create worksheets for different grade levels from a textbook page.
  - 'Visual Aid' (key: 'visual-aid'): Design simple line drawings or charts for a blackboard.
  - 'Reading Assessment' (key: 'reading-assessment'): Assess a student's reading from an audio recording.
  - 'Game Generator' (key: 'game-generator'): Create fun, low-resource educational games.
  - 'Lesson Planner' (key: 'lesson-planner'): Generate a 5-day lesson plan for a topic.
  - 'Self Assessment' (key: 'self-assessment'): Create a practice question and get AI feedback on the answer.

  Analyze the user's query and determine which feature is the best match by its key.
  - Provide a friendly, helpful 'suggestion' message to the user.
  - Set the 'target' field to the key of the matched feature.
  - If the query is unclear or doesn't match any feature, set the target to 'unknown' and ask for clarification in your suggestion.

  User Query: "{{{query}}}"
  `,
});

const navigationAssistantFlow = ai.defineFlow(
  {
    name: 'navigationAssistantFlow',
    inputSchema: NavigationAssistantInputSchema,
    outputSchema: NavigationAssistantOutputSchema,
    retries: 3,
    backoff: { delay: 500, multiplier: 2 },
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
