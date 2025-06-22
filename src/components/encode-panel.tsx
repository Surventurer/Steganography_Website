"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { encodeMessage } from '@/lib/steganography';
import { Upload, Download, Loader2, Pencil } from 'lucide-react';

export function EncodePanel() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [isEncoding, setIsEncoding] = useState(false);
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

  return (
    <Card className="w-full border-2 border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle>Encode a Message</CardTitle>
        <CardDescription>Hide your secret message inside an image.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
            <Label htmlFor="secret-message" className="flex items-center gap-2">
              <Pencil className="w-4 h-4" /> 2. Enter Secret Message
            </Label>
            <Textarea
              id="secret-message"
              placeholder="Your secret goes here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
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
