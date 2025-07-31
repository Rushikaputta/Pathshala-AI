'use server';
/**
 * @fileOverview Generates a self-testing assignment question.
 *
 * - generateAssignment - A function that handles assignment generation.
 * - GenerateAssignmentInput - The input type for generateAssignment.
 * - GenerateAssignmentOutput - The return type for generateAssignment.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateAssignmentInputSchema = z.object({
  topic: z.string().describe('The topic for the assignment.'),
  gradeLevel: z.string().describe('The target grade level.'),
});
export type GenerateAssignmentInput = z.infer<typeof GenerateAssignmentInputSchema>;

const GenerateAssignmentOutputSchema = z.object({
  question: z.string().describe('A short assignment question for self-testing.'),
});
export type GenerateAssignmentOutput = z.infer<typeof GenerateAssignmentOutputSchema>;

export async function generateAssignment(input: GenerateAssignmentInput): Promise<GenerateAssignmentOutput> {
  return generateAssignmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAssignmentPrompt',
  input: {schema: GenerateAssignmentInputSchema},
  output: {schema: GenerateAssignmentOutputSchema},
  prompt: `You are a teacher creating a short self-assessment question for a student.

  Generate a single, clear question about the given topic, appropriate for the specified grade level. The question should encourage a written response of a few sentences.

  Topic: {{{topic}}}
  Grade Level: {{{gradeLevel}}}
  `,
});

const generateAssignmentFlow = ai.defineFlow(
  {
    name: 'generateAssignmentFlow',
    inputSchema: GenerateAssignmentInputSchema,
    outputSchema: GenerateAssignmentOutputSchema,
    retries: 3,
    backoff: { delay: 500, multiplier: 2 },
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
