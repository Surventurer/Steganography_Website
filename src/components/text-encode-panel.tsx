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
  
  const handleEncode = () => {
    if (!coverText || !message) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide both a cover text and a secret message.',
      });
      return;
    }
    
    setIsEncoding(true);
    
    // Placeholder for future Python integration
    setTimeout(() => {
        toast({
            title: 'Ready for Integration!',
            description: 'The frontend is ready. You can now integrate your Python backend logic.',
        });
        setIsEncoding(false);
    }, 1000);
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
              className="min-h-[150px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secret-message-text" className="flex items-center gap-2">
              <Pencil className="w-4 h-4" /> 2. Enter Secret Message
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
