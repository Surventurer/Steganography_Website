"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2, Pencil, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

export function VideoEncodePanel({ className }: { className?: string }) {
  const { toast } = useToast();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [isEncoding, setIsEncoding] = useState(false);
  
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };
  
  const handleEncode = async () => {
    if (!videoFile || !message) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select a video file and enter a message.',
      });
      return;
    }

    setIsEncoding(true);

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('message', message);

    try {
      const response = await fetch('/api/video/encode', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `encoded_${videoFile.name}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast({ title: 'Success!', description: 'Video encoded successfully.' });
      } else {
        const error = await response.json();
        toast({
          variant: 'destructive',
          title: 'Encoding Failed',
          description: error.error || 'An unknown error occurred while encoding the video.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred while encoding the video.',
      });
    } finally {
      setIsEncoding(false);
    }
  };

  return (
    <Card className={cn("w-full border-2 border-primary/20 shadow-lg", className)}>
      <CardHeader>
        <CardTitle>Encode a Message in Video</CardTitle>
        <CardDescription>Hide your secret message inside a video file.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-upload" className="flex items-center gap-2">
              <Video className="w-4 h-4" /> 1. Upload Cover Video
            </Label>
            <Input id="video-upload" type="file" accept="video/*" onChange={handleVideoChange} className="file:text-primary" />
             {videoFile && <p className="text-sm text-muted-foreground pt-2">Selected: {videoFile.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="secret-message-video" className="flex items-center gap-2">
              <Pencil className="w-4 h-4" /> 2. Enter Secret Message
            </Label>
            <Textarea
              id="secret-message-video"
              placeholder="Your secret goes here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <Button onClick={handleEncode} disabled={isEncoding || !videoFile || !message} className="w-full text-lg py-6">
          {isEncoding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Encode & Download Video
        </Button>
      </CardContent>
    </Card>
  );
}
