"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2, Pencil, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TextEncodePanel({ className }: { className?: string }) {
  const { toast } = useToast();
  const [coverText, setCoverText] = useState('');
  const [message, setMessage] = useState('');
  const [isEncoding, setIsEncoding] = useState(false);
  const [maxCapacity, setMaxCapacity] = useState<number | null>(null);
  const [isCheckingCapacity, setIsCheckingCapacity] = useState(false);

  // const handleEncode = () => {
  //   if (!coverText || !message) {
  //     toast({
  //       variant: 'destructive',
  //       title: 'Missing Information',
  //       description: 'Please provide both a cover text and a secret message.',
  //     });
  //     return;
  //   }

  //   setIsEncoding(true);

  //   // Placeholder for future Python integration
  //   // setTimeout(() => {
  //   //   toast({
  //   //     title: 'Ready for Integration!',
  //   //     description: 'The frontend is ready. You can now integrate your Python backend logic.',
  //   //   });
  //   //   setIsEncoding(false);
  //   // }, 1000);
  // };
  const handleEncode = async () => {
    if (!coverText || !message) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide both a cover text and a secret message.',
      });
      return;
    }
  
    setIsEncoding(true);
  
    try {
      const response = await fetch('/api/text/encode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cover_text: coverText,          // ✅ match backend
          secret_message: message,        // ✅ match backend
        }),
      });
  
      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || 'Failed to encode text.');
      }
  
      const data = await response.json();
      // console.log("✅ ENCODED RESPONSE:", data);
  
      if (!data?.success || !data?.stego_text) {
        throw new Error('Invalid response from server.');
      }
  
      // Create a .txt file from the encoded text
      const blob = new Blob([data.stego_text], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'encoded-text.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
  
      toast({
        title: 'Success!',
        description: 'Your encoded text file is ready and downloading.',
      });
  
    } catch (error: any) {
      // console.error("❌ ENCODING ERROR:", error);
      toast({
        variant: 'destructive',
        title: 'Encoding Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsEncoding(false);
    }
  };
  

  
  //check-capacity handler
  const handleCoverTextBlur = async () => {
    if (!coverText.trim()) {
      console.log("[CoverTextBlur] Empty coverText, skipping capacity check.");
      return;
    }
  
    // console.log("[CoverTextBlur] Sending POST to /api/text/check-capacity with cover_text:", coverText);
  
    setIsCheckingCapacity(true);
  
    try {
      const res = await fetch('/api/text/check-capacity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cover_text: coverText }), // 🔥 FIXED: match your backend
      });
  
      // console.log("[CoverTextBlur] Response status:", res.status);
  
      if (!res.ok) {
        const errorText = await res.text();
        // console.error("[CoverTextBlur] Non-200 response:", errorText);
        throw new Error(`API responded with status ${res.status}`);
      }
  
      const data = await res.json();
      // console.log("[CoverTextBlur] Parsed response JSON:", data);
  
      setMaxCapacity(data?.actual_max_characters ?? null);
    } catch (error) {
      // console.error("[CoverTextBlur] Error while fetching capacity:", error);
      setMaxCapacity(null);
  
      toast({
        variant: 'destructive',
        title: 'Capacity Check Failed',
        description: 'Could not determine capacity from cover text.',
      });
    } finally {
      setIsCheckingCapacity(false);
      // console.log("[CoverTextBlur] Finished capacity check.");
    }
  };  

  return (
    <Card className={cn("w-full border-2 border-primary/20 shadow-lg", className)}>
      <CardHeader>
        <CardTitle>Encode a Message in Text</CardTitle>
        <CardDescription>Hide your secret message inside a cover text.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cover-text" className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> 1. Enter Cover Text
            </Label>
            <Textarea
              id="cover-text"
              placeholder="The text that will hide your message..."
              value={coverText}
              onChange={(e) => setCoverText(e.target.value)}
              onBlur={handleCoverTextBlur} // 👈 Will POST to the API when focus is lost
              className="min-h-[150px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secret-message-text" className="flex items-center gap-2">
              <Pencil className="w-4 h-4" /> 
              2. Enter Secret Message
              {isCheckingCapacity ? (
                <span className="text-xs text-muted-foreground ml-2">(checking...)</span>
              ) : maxCapacity !== null ? (
                <span className="text-xs text-muted-foreground ml-2">{maxCapacity} char only</span>
              ) : null}
            </Label>
            <Textarea
              id="secret-message-text"
              placeholder="Your secret goes here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <Button onClick={handleEncode} disabled={isEncoding || !coverText || !message} className="w-full text-lg py-6">
          {isEncoding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Encode & Get Text
        </Button>
      </CardContent>
    </Card>
  );
}
