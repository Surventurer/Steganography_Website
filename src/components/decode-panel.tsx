"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { decodeMessage } from '@/lib/steganography';
import { FileWarning, Terminal, Search } from 'lucide-react';

const MagnifyingGlass = () => (
  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md z-10">
    <div className="relative">
      <Search className="text-white h-24 w-24 animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-4 border-accent rounded-full animate-spin"></div>
    </div>
  </div>
);

export function DecodePanel() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [decodedMessage, setDecodedMessage] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setDecodedMessage(null); // Reset on new image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDecode = () => {
    if (!image || !canvasRef.current) {
      toast({
        variant: 'destructive',
        title: 'No Image',
        description: 'Please select an image to decode.',
      });
      return;
    }

    setIsDecoding(true);
    setDecodedMessage(null);

    const img = new window.Image();
    img.src = image;
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        toast({ variant: "destructive", title: "Error", description: "Could not get canvas context." });
        setIsDecoding(false);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const message = decodeMessage(imageData);
      
      // Add a small delay for the animation to be visible
      setTimeout(() => {
        setDecodedMessage(message);
        if (message) {
          toast({ title: 'Success!', description: 'A secret message was found.' });
        } else {
           toast({
            variant: 'default',
            title: 'No Message Found',
            description: 'We couldn\'t find a secret message in this image.',
          });
        }
        setIsDecoding(false);
      }, 1000);
    };
    img.onerror = () => {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load image for decoding.' });
        setIsDecoding(false);
    }
  };

  useEffect(() => {
    if (image) {
        handleDecode();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);


  return (
    <Card className="w-full border-2 border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle>Decode a Message</CardTitle>
        <CardDescription>Upload an image to reveal its hidden secret.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="image-decode-upload">Upload Image to Decode</Label>
          <Input id="image-decode-upload" type="file" accept="image/png, image/jpeg" onChange={handleImageChange} className="file:text-primary" />
        </div>
        
        {image && (
          <div className="relative w-full min-h-64 border rounded-md overflow-hidden flex items-center justify-center">
            {isDecoding && <MagnifyingGlass />}
            <Image src={image} alt="Upload for decoding" fill className="object-contain" data-ai-hint="magnifying glass abstract" />
          </div>
        )}
        
        {decodedMessage !== null && (
          decodedMessage ? (
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Revealed Message</AlertTitle>
              <AlertDescription className="font-code text-base mt-2 whitespace-pre-wrap">
                {decodedMessage}
              </AlertDescription>
            </Alert>
          ) : !isDecoding && (
            <Alert variant="destructive">
              <FileWarning className="h-4 w-4" />
              <AlertTitle>No Message Found</AlertTitle>
              <AlertDescription>
                This image does not appear to contain a hidden message, or the data may be corrupted.
              </AlertDescription>
            </Alert>
          )
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}
