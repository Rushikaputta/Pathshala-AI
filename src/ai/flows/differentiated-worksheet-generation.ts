// src/ai/flows/differentiated-worksheet-generation.ts
'use server';
/**
 * @fileOverview Generates differentiated worksheets based on an uploaded textbook page image.
 *
 * - generateDifferentiatedWorksheet - A function that handles the generation of differentiated worksheets.
 * - GenerateDifferentiatedWorksheetInput - The input type for the generateDifferentiatedWorksheet function.
 * - GenerateDifferentiatedWorksheetOutput - The return type for the generateDifferentiatedWorksheet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDifferentiatedWorksheetInputSchema = z.object({
  textbookPageImage: z
    .string()
    .describe(
      "A photo of a textbook page, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  gradeLevels: z
    .string()
    .describe("Comma-separated list of grade levels to tailor the worksheets to (e.g., '3, 4, 5')"),
});
export type GenerateDifferentiatedWorksheetInput = z.infer<typeof GenerateDifferentiatedWorksheetInputSchema>;

const GenerateDifferentiatedWorksheetOutputSchema = z.object({
  worksheets: z.array(
    z.object({
      gradeLevel: z.string().describe('The grade level of the worksheet.'),
      worksheetContent: z.string().describe('The content of the generated worksheet.'),
      answerKey: z.string().describe('A corresponding keysheet for the worksheet.'),
    })
  ).describe('An array of differentiated worksheets for each grade level.'),
});
export type GenerateDifferentiatedWorksheetOutput = z.infer<typeof GenerateDifferentiatedWorksheetOutputSchema>;

export async function generateDifferentiatedWorksheet(input: GenerateDifferentiatedWorksheetInput): Promise<GenerateDifferentiatedWorksheetOutput> {
  return differentiatedWorksheetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'differentiatedWorksheetPrompt',
  input: {schema: GenerateDifferentiatedWorksheetInputSchema},
  output: {schema: GenerateDifferentiatedWorksheetOutputSchema},
  prompt: `You are an expert educator specializing in creating differentiated learning materials for multi-grade classrooms.

You will receive a photo of a textbook page and a list of grade levels. Your task is to generate a worksheet tailored to each grade level, based on the content of the textbook page. For each worksheet, you must also generate a corresponding keysheet.

Ensure that the worksheets are appropriate for the specified grade level, and that they cover the key concepts from the textbook page.

Textbook Page:
{{media url=textbookPageImage}}

Grade Levels: {{{gradeLevels}}}

Output the worksheets as a JSON array, where each object in the array represents a worksheet for a specific grade level. Include a gradeLevel, worksheetContent, and answerKey field in each object.
`,
});

const differentiatedWorksheetFlow = ai.defineFlow(
  {
    name: 'differentiatedWorksheetFlow',
    inputSchema: GenerateDifferentiatedWorksheetInputSchema,
    outputSchema: GenerateDifferentiatedWorksheetOutputSchema,
    retries: 3,
    backoff: { delay: 500, multiplier: 2 },
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
