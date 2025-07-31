'use server';
/**
 * @fileOverview Generates weekly lesson plans.
 *
 * - generateLessonPlan - A function that handles lesson plan generation.
 * - GenerateLessonPlanInput - The input type for the generateLessonPlan function.
 * - GenerateLessonPlanOutput - The return type for the generateLessonPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateLessonPlanInputSchema = z.object({
  subject: z.string().describe('The subject for the lesson plan (e.g., "Math", "Science").'),
  gradeLevel: z.string().describe('The grade level for the lesson plan.'),
  topic: z.string().describe('The main topic to cover during the week.'),
  language: z.string().describe('The language for the lesson plan (e.g., "English", "Hindi").'),
});
export type GenerateLessonPlanInput = z.infer<typeof GenerateLessonPlanInputSchema>;

const GenerateLessonPlanOutputSchema = z.object({
  plan: z.array(
    z.object({
      day: z.string().describe('The day of the week (e.g., "Monday", "Day 1").'),
      topic: z.string().describe("The specific topic or learning objective for the day."),
      activity: z.string().describe("A simple, engaging activity for the lesson."),
      materials: z.string().describe("A list of simple, low-resource materials needed."),
    })
  ).describe('A 5-day lesson plan structure.'),
});
export type GenerateLessonPlanOutput = z.infer<typeof GenerateLessonPlanOutputSchema>;

export async function generateLessonPlan(input: GenerateLessonPlanInput): Promise<GenerateLessonPlanOutput> {
  return generateLessonPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLessonPlanPrompt',
  input: {schema: GenerateLessonPlanInputSchema},
  output: {schema: GenerateLessonPlanOutputSchema},
  prompt: `You are an expert curriculum developer creating a 5-day lesson plan for a teacher in a low-resource school in India.

  The lesson plan must be:
  - Appropriate for the specified subject and grade level.
  - Centered around the given weekly topic.
  - Composed of simple, engaging activities.
  - Reliant on materials that are easily accessible (e.g., blackboard, chalk, nature items, scrap paper).
  - Written in the specified language.

  Subject: {{{subject}}}
  Grade Level: {{{gradeLevel}}}
  Weekly Topic: {{{topic}}}
  Language: {{{language}}}
  `,
});

const generateLessonPlanFlow = ai.defineFlow(
  {
    name: 'generateLessonPlanFlow',
    inputSchema: GenerateLessonPlanInputSchema,
    outputSchema: GenerateLessonPlanOutputSchema,
    retries: 3,
    backoff: { delay: 500, multiplier: 2 },
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
