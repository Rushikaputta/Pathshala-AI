'use server';
/**
 * @fileOverview Evaluates a student's assignment answer.
 *
 * - evaluateAssignment - A function that handles assignment evaluation.
 * - EvaluateAssignmentInput - The input type for evaluateAssignment.
 * - EvaluateAssignmentOutput - The return type for evaluateAssignment.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const EvaluateAssignmentInputSchema = z.object({
  question: z.string().describe('The original assignment question.'),
  answer: z.string().describe("The student's answer to the question."),
});
export type EvaluateAssignmentInput = z.infer<typeof EvaluateAssignmentInputSchema>;

const EvaluateAssignmentOutputSchema = z.object({
  score: z.string().describe('A one-word evaluation of the answer (e.g., Excellent, Good, Average, Poor, Bad).'),
  emoji: z.string().describe('An emoji that represents the score (e.g., 🏆, 😄, 🙂, 😐, 😞).'),
  feedback: z.string().describe('Constructive feedback and suggestions for improvement.'),
});
export type EvaluateAssignmentOutput = z.infer<typeof EvaluateAssignmentOutputSchema>;

export async function evaluateAssignment(input: EvaluateAssignmentInput): Promise<EvaluateAssignmentOutput> {
  return evaluateAssignmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateAssignmentPrompt',
  input: {schema: EvaluateAssignmentInputSchema},
  output: {schema: EvaluateAssignmentOutputSchema},
  prompt: `You are a helpful teacher evaluating a student's self-assessment answer.

  Analyze the student's answer based on the original question.
  1.  Assess the correctness and clarity of the answer.
  2.  Provide a one-word score based on the quality of the answer from the following options: "Excellent", "Good", "Average", "Poor", or "Bad".
  3.  Choose a single emoji that reflects the score: 🏆 for Excellent, 😄 for Good, 🙂 for Average, 😐 for Poor, or 😞 for Bad.
  4.  Write clear, constructive feedback with suggestions for what the student can do to improve.

  Question: "{{{question}}}"
  Student's Answer: "{{{answer}}}"
  `,
});

const evaluateAssignmentFlow = ai.defineFlow(
  {
    name: 'evaluateAssignmentFlow',
    inputSchema: EvaluateAssignmentInputSchema,
    outputSchema: EvaluateAssignmentOutputSchema,
    retries: 3,
    backoff: { delay: 500, multiplier: 2 },
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
