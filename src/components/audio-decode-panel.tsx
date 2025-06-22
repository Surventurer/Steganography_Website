"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Terminal, Search, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

export function AudioDecodePanel({ className }: { className?: string }) {
  const { toast } = useToast();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [decodedMessage, setDecodedMessage] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
      setDecodedMessage(null);
    }
  };

  const handleDecode = () => {
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

    // Placeholder for future Python integration
    setTimeout(() => {
        setDecodedMessage("This is a placeholder for the revealed message from audio.");
        toast({ title: 'Success!', description: 'A secret message was found (placeholder).' });
        setIsDecoding(false);
    }, 1000);
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
            <AlertTitle>Revealed Message</AlertTitle>
            <AlertDescription className="font-code text-base mt-2 whitespace-pre-wrap">
              {decodedMessage}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
