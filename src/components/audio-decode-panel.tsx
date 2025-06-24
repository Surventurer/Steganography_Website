"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Terminal, Search, Music, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

// Interface to match the backend JSON response
interface DecodeResponse {
  message?: string | null;
  error?: string;
}

export function AudioDecodePanel({ className }: { className?: string }) {
  const { toast } = useToast();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [decodedMessage, setDecodedMessage] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
      setDecodedMessage(null); // Reset on new file selection
    }
  };

  const handleDecode = async () => {
    if (!audioFile) {
      toast({
        variant: 'destructive',
        title: 'No Audio File',
        description: 'Please select an audio file to decode.',
      });
      return;
    }

    setIsDecoding(true);
    setDecodedMessage(null);

    const formData = new FormData();
    formData.append('audio_file', audioFile);

    try {
      const response = await fetch('/api/audio/decode', {
        method: 'POST',
        body: formData,
      });

      const result: DecodeResponse = await response.json();

      if (response.ok) {
        if (result.message) {
          setDecodedMessage(result.message);
          toast({
            title: 'Success!',
            description: 'A secret message was found in the audio file.',
          });
        } else {
          // Handles the case where the backend successfully checks but finds no message
          setDecodedMessage(result.error || 'No hidden message was found.');
          toast({
            variant: 'default',
            title: 'No Message Found',
            description: result.error || 'The audio file does not seem to contain a hidden message.',
          });
        }
      } else {
        // Handles HTTP errors like 400, 500 from the backend
        setDecodedMessage(`Error: ${result.error || 'An unknown error occurred.'}`);
        toast({
          variant: 'destructive',
          title: 'Decoding Failed',
          description: result.error || 'Could not decode the audio file.',
        });
      }
    } catch (error) {
      // Handles network errors (e.g., server is down)
      setDecodedMessage('Error: Failed to connect to the server.');
      toast({
        variant: 'destructive',
        title: 'Network Error',
        description: 'Failed to connect to the server. Please check your connection.',
      });
    } finally {
      setIsDecoding(false);
    }
  };

  return (
    <Card className={cn("w-full border-2 border-primary/20 shadow-lg", className)}>
      <CardHeader>
        <CardTitle>Decode a Message from Audio</CardTitle>
        <CardDescription>Upload an audio file to reveal its hidden secret.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="audio-decode-upload" className="flex items-center gap-2"><Music className="w-4 h-4"/>Upload Audio to Decode</Label>
          <Input id="audio-decode-upload" type="file" accept="audio/*" onChange={handleAudioChange} className="file:text-primary" />
        </div>
        
        <Button onClick={handleDecode} disabled={isDecoding || !audioFile} className="w-full text-lg py-6">
          {isDecoding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          Decode Message
        </Button>

        {decodedMessage !== null && (
          <Alert className="mt-4">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Revealed Content</AlertTitle>
            <AlertDescription className="font-code text-base mt-2 whitespace-pre-wrap">
              {decodedMessage}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}