'use server';

/**
 * @fileOverview Generates a realistic-sounding but misleading "cover story" to accompany a steganography image.
 *
 * - generateCoverStory - A function that generates the cover story.
 * - GenerateCoverStoryInput - The input type for the generateCoverStory function.
 * - GenerateCoverStoryOutput - The return type for the generateCoverStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCoverStoryInputSchema = z.object({
  topic: z.string().describe('The general topic for the cover story.'),
  message: z.string().describe('The secret message hidden inside the image.'),
});

export type GenerateCoverStoryInput = z.infer<typeof GenerateCoverStoryInputSchema>;

const GenerateCoverStoryOutputSchema = z.object({
  coverStory: z.string().describe('The generated cover story.'),
});

export type GenerateCoverStoryOutput = z.infer<typeof GenerateCoverStoryOutputSchema>;

export async function generateCoverStory(
  input: GenerateCoverStoryInput
): Promise<GenerateCoverStoryOutput> {
  return generateCoverStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCoverStoryPrompt',
  input: {schema: GenerateCoverStoryInputSchema},
  output: {schema: GenerateCoverStoryOutputSchema},
  prompt: `You are a creative writer tasked with generating a realistic-sounding but misleading "cover story" to accompany a steganography image. The goal is to provide a plausible explanation for the image that conceals its true content.

  The secret message is: {{{message}}}

  The user wants the cover story to be about the following topic: {{{topic}}}

  Generate a compelling cover story that is at least 5 sentences long. Make it sound believable and engaging, so that anyone who reads it will not suspect that the image contains a hidden message.`,
});

const generateCoverStoryFlow = ai.defineFlow(
  {
    name: 'generateCoverStoryFlow',
    inputSchema: GenerateCoverStoryInputSchema,
    outputSchema: GenerateCoverStoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
