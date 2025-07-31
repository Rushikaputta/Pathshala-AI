'use server';
/**
 * @fileOverview Assesses a student's reading ability from an audio recording.
 *
 * - readingAssessment - A function that handles the reading assessment.
 * - ReadingAssessmentInput - The input type for the readingAssessment function.
 * - ReadingAssessmentOutput - The return type for the readingAssessment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ReadingAssessmentInputSchema = z.object({
  referenceText: z.string().describe('The text the student was supposed to read.'),
  audioDataUri: z
    .string()
    .describe(
      "An audio recording of the student reading, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.string().describe('The language of the reference text (e.g., "English", "Hindi").'),
});
export type ReadingAssessmentInput = z.infer<typeof ReadingAssessmentInputSchema>;

const ReadingAssessmentOutputSchema = z.object({
  transcribedText: z.string().describe('The text transcribed from the student\'s audio.'),
  accuracy: z
    .number()
    .describe(
      'The reading accuracy as a percentage (e.g., 95.5 for 95.5%).'
    ),
  fluency: z
    .string()
    .describe(
      'A qualitative assessment of the reading fluency (e.g., "Good pace", "Choppy", "Monotone").'
    ),
  mispronouncedWords: z
    .array(z.string())
    .describe('A list of words that were likely mispronounced.'),
  feedback: z
    .string()
    .describe(
      'Constructive feedback for the student to help them improve.'
    ),
});
export type ReadingAssessmentOutput = z.infer<typeof ReadingAssessmentOutputSchema>;

export async function readingAssessment(input: ReadingAssessmentInput): Promise<ReadingAssessmentOutput> {
  return readingAssessmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'readingAssessmentPrompt',
  input: {schema: ReadingAssessmentInputSchema},
  output: {schema: ReadingAssessmentOutputSchema},
  prompt: `You are an expert reading coach. Your task is to analyze an audio recording of a student reading a text and provide a detailed assessment.

  1.  Transcribe the audio to text.
  2.  Compare the transcribed text to the provided reference text.
  3.  Calculate the reading accuracy as a percentage.
  4.  Assess the fluency (pacing, intonation, rhythm).
  5.  Identify any mispronounced words.
  6.  Provide constructive feedback for improvement.

  The assessment should be in the same language as the reference text.

  Language: {{{language}}}
  Reference Text:
  "{{{referenceText}}}"

  Student's Audio Recording:
  {{media url=audioDataUri}}
  `,
});

const readingAssessmentFlow = ai.defineFlow(
  {
    name: 'readingAssessmentFlow',
    inputSchema: ReadingAssessmentInputSchema,
    outputSchema: ReadingAssessmentOutputSchema,
    retries: 3,
    backoff: { delay: 500, multiplier: 2 },
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
