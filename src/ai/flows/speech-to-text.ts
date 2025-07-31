'use server';
/**
 * @fileOverview Transcribes audio to text.
 *
 * - speechToText - A function that handles audio transcription.
 * - SpeechToTextInput - The input type for speechToText.
 * - SpeechToTextOutput - The return type for speechToText.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SpeechToTextInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "An audio recording, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SpeechToTextInput = z.infer<typeof SpeechToTextInputSchema>;

const SpeechToTextOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the audio.'),
});
export type SpeechToTextOutput = z.infer<typeof SpeechToTextOutputSchema>;

export async function speechToText(input: SpeechToTextInput): Promise<SpeechToTextOutput> {
  return speechToTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'speechToTextPrompt',
  input: {schema: SpeechToTextInputSchema},
  output: {schema: SpeechToTextOutputSchema},
  prompt: `Transcribe the following audio recording to text.

  {{media url=audioDataUri}}
  `,
});

const speechToTextFlow = ai.defineFlow(
  {
    name: 'speechToTextFlow',
    inputSchema: SpeechToTextInputSchema,
    outputSchema: SpeechToTextOutputSchema,
    retries: 3,
    backoff: { delay: 500, multiplier: 2 },
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
