"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2, Pencil, Music, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CapacityResponse {
  success: boolean;
  file_format?: string;
  actual_max_characters?: number;
  message?: string;
  next_step?: string;
  error?: string;
}

interface EncodeResponse {
  success: boolean;
  message?: string;
  stego_filename?: string;
  file_format?: string;
  download_url?: string;
  error?: string;
}

export function AudioEncodePanel({ className }: { className?: string }) {
  const { toast } = useToast();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [isCheckingCapacity, setIsCheckingCapacity] = useState(false);
  const [isEncoding, setIsEncoding] = useState(false);
  const [capacity, setCapacity] = useState<number | null>(null);
  const [fileFormat, setFileFormat] = useState<string>('');
  
  // Configure your API base URL here
  // const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      setCapacity(null);
      setFileFormat('');
      
      // Automatically check capacity when file is selected
      await checkCapacity(file);
    }
  };
  
  const checkCapacity = async (file: File) => {
    setIsCheckingCapacity(true);
    
    try {
      const formData = new FormData();
      formData.append('audio_file', file);
      
      const response = await fetch(`/api/audio/check-capacity`, {
        method: 'POST',
        body: formData,
      });
      
      const result: CapacityResponse = await response.json();
      
      if (result.success && result.actual_max_characters) {
        setCapacity(result.actual_max_characters);
        setFileFormat(result.file_format || '');
        
        toast({
          title: 'Capacity Analyzed',
          description: `${result.file_format} file can hide up to ${result.actual_max_characters} characters.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Capacity Check Failed',
          description: result.error || 'Unable to analyze audio file capacity.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Network Error',
        description: 'Failed to connect to the server. Please check your connection.',
      });
    } finally {
      setIsCheckingCapacity(false);
    }
  };
  
  const handleEncodeAndDownload = async () => {
    if (!audioFile || !message) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select an audio file and enter a message.',
      });
      return;
    }
    
    if (capacity !== null && message.length > capacity) {
      toast({
        variant: 'destructive',
        title: 'Message Too Long',
        description: `Message is ${message.length} characters, but maximum capacity is ${capacity} characters.`,
      });
      return;
    }
    
    setIsEncoding(true);
    
    try {
      // Step 1: Encode the message
      const formData = new FormData();
      formData.append('audio_file', audioFile);
      formData.append('secret_message', message);
      
      const encodeResponse = await fetch(`/api/audio/encode`, {
        method: 'POST',
        body: formData,
      });
      
      const encodeResult: EncodeResponse = await encodeResponse.json();
      
      if (encodeResult.success && encodeResult.stego_filename && encodeResult.download_url) {
        toast({
          title: 'Encoding Complete',
          description: `Message hidden in ${encodeResult.file_format} file. Starting download...`,
        });
        
        // Step 2: Automatically download the file
        const downloadResponse = await fetch(`${encodeResult.download_url}`);
        
        if (!downloadResponse.ok) {
          throw new Error('Download failed');
        }
        
        const blob = await downloadResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = encodeResult.stego_filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: 'Success!',
          description: 'Message encoded and steganographic audio downloaded successfully.',
        });
        
        // Clean up the file on server after download
        cleanupFile(encodeResult.stego_filename);
        
        // Reset form for next use
        setAudioFile(null);
        setMessage('');
        setCapacity(null);
        setFileFormat('');
        const fileInput = document.getElementById('audio-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
      } else {
        toast({
          variant: 'destructive',
          title: 'Encoding Failed',
          description: encodeResult.error || 'Failed to encode message into audio file.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Process Failed',
        description: 'Failed to encode or download the file. Please check your connection.',
      });
    } finally {
      setIsEncoding(false);
    }
  };
  
  const cleanupFile = async (filename: string) => {
    try {
      await fetch(`/api/audio/cleanup/${filename}`, {
        method: 'DELETE',
      });
    } catch (error) {
      // Silent cleanup - not critical if it fails
      console.log('File cleanup failed:', error);
    }
  };

  const getCharacterCountColor = () => {
    if (capacity === null || !message) return 'text-muted-foreground';
    const ratio = message.length / capacity;
    if (ratio > 1) return 'text-destructive';
    if (ratio > 0.8) return 'text-orange-500';
    return 'text-green-600';
  };

  return (
    <Card className={cn("w-full border-2 border-primary/20 shadow-lg", className)}>
      <CardHeader>
        <CardTitle>Encode a Message in Audio</CardTitle>
        <CardDescription>Hide your secret message inside an audio file.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="audio-upload" className="flex items-center gap-2">
              <Music className="w-4 h-4" /> 1. Upload Cover Audio
            </Label>
            <Input 
              id="audio-upload" 
              type="file" 
              accept="audio/*" 
              onChange={handleAudioChange} 
              className="file:text-primary" 
            />
            {audioFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Selected: {audioFile.name}</span>
                {isCheckingCapacity && <Loader2 className="w-4 h-4 animate-spin" />}
              </div>
            )}
            {capacity !== null && fileFormat && (
              <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                <Info className="w-4 h-4" />
                <span>{fileFormat} format • Capacity: {capacity} characters</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="secret-message-audio" className="flex items-center gap-2">
              <Pencil className="w-4 h-4" /> 2. Enter Secret Message
            </Label>
            <Textarea
              id="secret-message-audio"
              placeholder="Your secret goes here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
            {message && capacity !== null && (
              <div className={cn("text-sm font-medium", getCharacterCountColor())}>
                {message.length} / {capacity} characters
                {message.length > capacity && (
                  <div className="flex items-center gap-1 text-destructive mt-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Message exceeds capacity!</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <Button 
          onClick={handleEncodeAndDownload} 
          disabled={isEncoding || isCheckingCapacity || !audioFile || !message || (capacity !== null && message.length > capacity)} 
          className="w-full text-lg py-6"
        >
          {isEncoding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Encoding Audio...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Encode & Download Audio
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}