'use server';
/**
 * @fileOverview Converts text to speech.
 *
 * - readAloud - A function that handles text-to-speech conversion.
 * - ReadAloudInput - The input type for the readAloud function.
 * - ReadAloudOutput - The return type for the readAloud function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'zod';
import wav from 'wav';

const ReadAloudInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
});
export type ReadAloudInput = z.infer<typeof ReadAloudInputSchema>;

const ReadAloudOutputSchema = z.object({
  audioUrl: z
    .string()
    .describe('The data URI of the generated audio file (WAV format).'),
});
export type ReadAloudOutput = z.infer<typeof ReadAloudOutputSchema>;

export async function readAloud(
  input: ReadAloudInput
): Promise<ReadAloudOutput> {
  return readAloudFlow(input);
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const readAloudFlow = ai.defineFlow(
  {
    name: 'readAloudFlow',
    inputSchema: ReadAloudInputSchema,
    outputSchema: ReadAloudOutputSchema,
  },
  async ({text}) => {
    const {media} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Achernar'},
          },
        },
      },
      prompt: text,
    });

    if (!media) {
      throw new Error('No media returned from TTS generation.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavBase64 = await toWav(audioBuffer);

    return {
      audioUrl: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);
