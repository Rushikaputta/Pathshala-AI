'use server';

/**
 * @fileOverview AI Knowledge Base flow for providing simple explanations to student questions.
 *
 * - aiKnowledgeBase - A function that handles the knowledge base process.
 * - AIKnowledgeBaseInput - The input type for the aiKnowledgeBase function.
 * - AIKnowledgeBaseOutput - The return type for the aiKnowledgeBase function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIKnowledgeBaseInputSchema = z.object({
  question: z.string().describe('The question to be answered.'),
  language: z.string().describe('The local language for the explanation and analogy.'),
});
export type AIKnowledgeBaseInput = z.infer<typeof AIKnowledgeBaseInputSchema>;

const AIKnowledgeBaseOutputSchema = z.object({
  explanation: z.string().describe('A simple, accurate explanation of the answer in the local language.'),
  analogy: z.string().describe('An easy-to-understand analogy in the local language.'),
});
export type AIKnowledgeBaseOutput = z.infer<typeof AIKnowledgeBaseOutputSchema>;

export async function aiKnowledgeBase(input: AIKnowledgeBaseInput): Promise<AIKnowledgeBaseOutput> {
  return aiKnowledgeBaseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiKnowledgeBasePrompt',
  input: {schema: AIKnowledgeBaseInputSchema},
  output: {schema: AIKnowledgeBaseOutputSchema},
  prompt: `You are a helpful teacher explaining complex topics to students in their local language.

  Answer the following question in a simple, accurate way in the specified language. Also, provide an easy-to-understand analogy in the same language to help the student understand the concept better.

  Question: {{{question}}}
  Language: {{{language}}}

  Explanation:
  Analogy:`,
});

const aiKnowledgeBaseFlow = ai.defineFlow(
  {
    name: 'aiKnowledgeBaseFlow',
    inputSchema: AIKnowledgeBaseInputSchema,
    outputSchema: AIKnowledgeBaseOutputSchema,
    retries: 3,
    backoff: { delay: 500, multiplier: 2 },
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
