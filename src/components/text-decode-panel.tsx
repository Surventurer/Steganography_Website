"use client";

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Terminal, Search, Loader2, FileWarning } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TextDecodePanel({ className }: { className?: string }) {
  const { toast } = useToast();
  const [textFile, setTextFile] = useState<File | null>(null);
  const [decodedMessage, setDecodedMessage] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTextFile(file);
      setDecodedMessage(null); // Reset on new file
    }
  };

  const handleDecode = async () => {
    if (!textFile) {
      toast({
        variant: 'destructive',
        title: 'No File',
        description: 'Please select a text file to decode.',
      });
      return;
    }

    setIsDecoding(true);
    setDecodedMessage(null);

    const formData = new FormData();
    formData.append('text_file', textFile);

    try {
      const response = await fetch('/api/text/decode', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const result = await response.json();
      console.log('Response result:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to decode text.');
      }

      if (result.success && result.hidden_message) {
        setDecodedMessage(result.hidden_message);
        toast({ title: 'Success!', description: 'A secret message was found.' });
      } else {
        setDecodedMessage(''); // Set to empty string to indicate "not found"
        toast({
          variant: 'default',
          title: 'No Message Found',
          description: result.error || 'We couldn\'t find a secret message in this text.',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Decoding Error',
        description: error.message || 'An unexpected error occurred.',
      });
      setDecodedMessage(null);
    } finally {
      setIsDecoding(false);
    }
  };

  return (
    <Card className={cn('w-full border-2 border-primary/20 shadow-lg flex flex-col', className)}>
      <CardHeader>
        <CardTitle>Decode a Message from Text</CardTitle>
        <CardDescription>Upload an text to reveal its hidden secret.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex-grow flex flex-col">
        <div className="space-y-2">
          <Label htmlFor="text-decode-upload">Upload Text to Decode</Label>
          <Input 
            id="text-decode-upload" 
            type="file" 
            accept=".txt" 
            onChange={handleTextChange} 
            className="file:text-primary" 
          />
        </div>

        <Button
          onClick={handleDecode}
          disabled={isDecoding || !textFile}
          className="w-full text-lg py-6 mt-auto"
        >
          {isDecoding ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          Decode Message
        </Button>

        {decodedMessage !== null && (
          decodedMessage ? (
            <Alert className="mt-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Revealed Message</AlertTitle>
              <AlertDescription className="font-code text-base mt-2 whitespace-pre-wrap break-words">
                {decodedMessage}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive" className="mt-4">
              <FileWarning className="h-4 w-4" />
              <AlertTitle>No Message Found</AlertTitle>
              <AlertDescription>
                This text file does not appear to contain a hidden message, or the data may be corrupted.
              </AlertDescription>
            </Alert>
          )
        )}
      </CardContent>
    </Card>
  );
}
