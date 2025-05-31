'use server';
/**
 * @fileOverview Extracts license plate number from an image using Gemini Vision.
 *
 * - extractLicensePlateFromImage - A function that handles the license plate extraction process.
 * - ExtractLicensePlateFromImageInput - The input type for the extractLicensePlateFromImage function.
 * - ExtractLicensePlateFromImageOutput - The return type for the extractLicensePlateFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractLicensePlateFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a license plate, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractLicensePlateFromImageInput = z.infer<typeof ExtractLicensePlateFromImageInputSchema>;

const ExtractLicensePlateFromImageOutputSchema = z.object({
  licensePlateNumber: z.string().describe('The extracted license plate number.'),
  isLicensePlateDetected: z.boolean().describe('Whether or not a license plate was detected in the image.'),
});
export type ExtractLicensePlateFromImageOutput = z.infer<typeof ExtractLicensePlateFromImageOutputSchema>;

export async function extractLicensePlateFromImage(input: ExtractLicensePlateFromImageInput): Promise<ExtractLicensePlateFromImageOutput> {
  return extractLicensePlateFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractLicensePlateFromImagePrompt',
  input: {schema: ExtractLicensePlateFromImageInputSchema},
  output: {schema: ExtractLicensePlateFromImageOutputSchema},
  prompt: `You are an AI assistant designed to extract license plate numbers from images.

  Analyze the image and extract the license plate number. If no license plate is found set isLicensePlateDetected to false, otherwise set it to true and return the extracted license plate number. Return only the license plate number if found, do not include any other text. 

  Image: {{media url=photoDataUri}}`,
});

const extractLicensePlateFromImageFlow = ai.defineFlow(
  {
    name: 'extractLicensePlateFromImageFlow',
    inputSchema: ExtractLicensePlateFromImageInputSchema,
    outputSchema: ExtractLicensePlateFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
