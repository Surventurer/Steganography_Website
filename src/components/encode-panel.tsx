"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, Loader2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EncodePanel({ className }: { className?: string }) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [isEncoding, setIsEncoding] = useState(false);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleEncode = async () => {
    if (!imageFile || !message) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select an image and enter a message to encode.',
      });
      return;
    }
    
    setIsEncoding(true);

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('message', message);
    
    try {
      const response = await fetch('/api/image/encode', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || 'Failed to encode image.');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `encoded-${imageFile.name}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success!',
        description: 'Your image has been encoded and download has started.',
      });

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Encoding Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsEncoding(false);
    }
  };

  return (
    <Card className={cn("w-full border-2 border-primary/20 shadow-lg flex flex-col", className)}>
      <CardHeader>
        <CardTitle>Encode a Message</CardTitle>
        <CardDescription>Hide your secret message inside an image.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex-grow flex flex-col">
        <div className="space-y-4 flex-grow flex flex-col">
          <div className="space-y-2">
            <Label htmlFor="image-upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" /> 1. Upload Cover Image
            </Label>
            <Input id="image-upload" type="file" accept="image/png, image/jpeg, image/jpg, image/tiff" onChange={handleImageChange} className="file:text-primary" />
          </div>
          {imagePreview && (
            <div className="relative w-full h-48 border rounded-md overflow-hidden">
              <Image src={imagePreview} alt="Upload preview" fill className="object-contain" data-ai-hint="image upload" />
            </div>
          )}
          <div className="space-y-2 flex-grow flex flex-col">
            <Label htmlFor="secret-message" className="flex items-center gap-2">
              <Pencil className="w-4 h-4" /> 2. Enter Secret Message
            </Label>
            <Textarea
              id="secret-message"
              placeholder="Your secret goes here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px] flex-grow"
            />
          </div>
        </div>
        <Button onClick={handleEncode} disabled={isEncoding || !imageFile || !message} className="w-full text-lg py-6 mt-auto">
          {isEncoding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Encode & Download Image
        </Button>
      </CardContent>
    </Card>
  );
}
