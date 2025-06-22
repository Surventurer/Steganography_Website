"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { encodeMessage } from '@/lib/steganography';
import { generateCoverStory, type GenerateCoverStoryInput } from '@/ai/flows/generate-cover-story';
import { Upload, Download, Sparkles, Loader2, Copy, Terminal } from 'lucide-react';

export function EncodePanel() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [topic, setTopic] = useState('');
  const [coverStory, setCoverStory] = useState('');
  const [isEncoding, setIsEncoding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleGenerateCoverStory = async () => {
    if (!topic || !message) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide a secret message and a topic for the cover story.',
      });
      return;
    }
    setIsGenerating(true);
    setCoverStory('');
    try {
      const input: GenerateCoverStoryInput = { topic, message };
      const result = await generateCoverStory(input);
      setCoverStory(result.coverStory);
    } catch (error) {
      console.error('Failed to generate cover story:', error);
      toast({
        variant: 'destructive',
        title: 'AI Generation Failed',
        description: 'Could not generate a cover story. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleEncode = () => {
    if (!imageFile || !message || !canvasRef.current) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select an image and enter a message to encode.',
      });
      return;
    }
    
    setIsEncoding(true);
    
    const img = new window.Image();
    img.src = image as string;
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        toast({ variant: "destructive", title: "Error", description: "Could not get canvas context." });
        setIsEncoding(false);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      const encodedImageData = encodeMessage(imageData, message);
      
      if (!encodedImageData) {
        toast({
          variant: 'destructive',
          title: 'Encoding Failed',
          description: 'The message is too long for the selected image.',
        });
        setIsEncoding(false);
        return;
      }
      
      ctx.putImageData(encodedImageData, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'encoded-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Success!',
        description: 'Your image has been encoded and download has started.',
      });
      setIsEncoding(false);
    };
    img.onerror = () => {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load image for encoding.' });
        setIsEncoding(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverStory);
    toast({ title: 'Copied!', description: 'Cover story copied to clipboard.' });
  }

  return (
    <Card className="w-full border-2 border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle>Encode a Message</CardTitle>
        <CardDescription>Hide your secret message inside an image.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" /> 1. Upload Cover Image
              </Label>
              <Input id="image-upload" type="file" accept="image/png, image/jpeg" onChange={handleImageChange} className="file:text-primary" />
            </div>
            {image && (
              <div className="relative w-full h-48 border rounded-md overflow-hidden">
                <Image src={image} alt="Upload preview" fill className="object-contain" data-ai-hint="image upload" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="secret-message">2. Enter Secret Message</Label>
              <Textarea
                id="secret-message"
                placeholder="Your secret goes here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <div className="space-y-4">
            <Card className="bg-background/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="text-accent w-5 h-5" /> AI Cover Story (Optional)
                </CardTitle>
                <CardDescription>Generate a plausible story to accompany your image.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Story Topic</Label>
                  <Input 
                    id="topic" 
                    placeholder="e.g., 'My trip to the mountains'" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <Button onClick={handleGenerateCoverStory} disabled={isGenerating || !message || !topic} className="w-full">
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate Story
                </Button>
                {coverStory && (
                   <Alert>
                     <Terminal className="h-4 w-4" />
                     <AlertTitle className="flex justify-between items-center">
                       Generated Story
                       <Button variant="ghost" size="icon" onClick={copyToClipboard}><Copy className="w-4 h-4" /></Button>
                     </AlertTitle>
                     <AlertDescription className="font-code text-sm mt-2">
                       {coverStory}
                     </AlertDescription>
                   </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        <Button onClick={handleEncode} disabled={isEncoding || !image || !message} className="w-full text-lg py-6">
          {isEncoding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Encode & Download Image
        </Button>
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}
