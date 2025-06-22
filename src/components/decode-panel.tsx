"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileWarning, Terminal, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DecodePanel({ className }: { className?: string }) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [decodedMessage, setDecodedMessage] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setDecodedMessage(null); // Reset on new image

      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDecode = async () => {
    if (!imageFile) {
      toast({
        variant: 'destructive',
        title: 'No Image',
        description: 'Please select an image to decode.',
      });
      return;
    }

    setIsDecoding(true);
    setDecodedMessage(null);

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch('/api/image/decode', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to decode image.');
      }

      if (result.message) {
        setDecodedMessage(result.message);
        toast({ title: 'Success!', description: 'A secret message was found.' });
      } else {
        setDecodedMessage(''); // Set to empty string to indicate "not found"
        toast({
          variant: 'default',
          title: 'No Message Found',
          description: result.error || 'We couldn\'t find a secret message in this image.',
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
    <Card className={cn("w-full border-2 border-primary/20 shadow-lg flex flex-col", className)}>
      <CardHeader>
        <CardTitle>Decode a Message</CardTitle>
        <CardDescription>Upload an image to reveal its hidden secret.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex-grow flex flex-col">
        <div className="space-y-2">
          <Label htmlFor="image-decode-upload">Upload Image to Decode</Label>
          <Input id="image-decode-upload" type="file" accept="image/png, image/jpeg, image/jpg, image/tiff" onChange={handleImageChange} className="file:text-primary" />
        </div>
        
        {imagePreview && (
            <div className="relative w-full min-h-64 border rounded-md overflow-hidden flex items-center justify-center flex-grow">
              <Image src={imagePreview} alt="Upload for decoding" fill className="object-contain" data-ai-hint="magnifying glass abstract" />
            </div>
          )}
        
        <Button onClick={handleDecode} disabled={isDecoding || !imageFile} className="w-full text-lg py-6 mt-auto">
          {isDecoding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          Decode Message
        </Button>

        {decodedMessage !== null && (
          decodedMessage ? (
            <Alert className="mt-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Revealed Message</AlertTitle>
              <AlertDescription className="font-code text-base mt-2 whitespace-pre-wrap">
                {decodedMessage}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive" className="mt-4">
              <FileWarning className="h-4 w-4" />
              <AlertTitle>No Message Found</AlertTitle>
              <AlertDescription>
                This image does not appear to contain a hidden message, or the data may be corrupted.
              </AlertDescription>
            </Alert>
          )
        )}
      </CardContent>
    </Card>
  );
}
