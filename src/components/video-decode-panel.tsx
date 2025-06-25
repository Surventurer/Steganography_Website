"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Terminal, Search, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

export function VideoDecodePanel({ className }: { className?: string }) {
  const { toast } = useToast();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [decodedMessage, setDecodedMessage] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
      setDecodedMessage(null);
    }
  };

  const handleDecode = async () => {
    if (!videoFile) {
      toast({
        variant: 'destructive',
        title: 'No Video File',
        description: 'Please select a video file to decode.',
      });
      return;
    }

    setIsDecoding(true);
    setDecodedMessage(null);

    const formData = new FormData();
    formData.append('video', videoFile);

    try {
      const response = await fetch('/api/video/decode', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setDecodedMessage(data.message);
        toast({ title: 'Success!', description: 'Message decoded successfully.' });
      } else {
        const error = await response.json();
        toast({ variant: 'destructive', title: 'Error', description: error.error });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to decode video.' });
    } finally {
      setIsDecoding(false);
    }
  };

  return (
    <Card className={cn("w-full border-2 border-primary/20 shadow-lg", className)}>
      <CardHeader>
        <CardTitle>Decode a Message from Video</CardTitle>
        <CardDescription>Upload a video file to reveal its hidden secret.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="video-decode-upload" className="flex items-center gap-2"><Video className="w-4 h-4"/>Upload Video to Decode</Label>
          <Input id="video-decode-upload" type="file" accept="video/*" onChange={handleVideoChange} className="file:text-primary" />
        </div>
        
        <Button onClick={handleDecode} disabled={isDecoding || !videoFile} className="w-full text-lg py-6">
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
