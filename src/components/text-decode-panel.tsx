"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Terminal, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TextDecodePanel({ className }: { className?: string }) {
  const { toast } = useToast();
  const [stegoText, setStegoText] = useState('');
  const [decodedMessage, setDecodedMessage] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);

  const handleDecode = () => {
    if (!stegoText) {
      toast({
        variant: 'destructive',
        title: 'No Text',
        description: 'Please enter the text containing a hidden message.',
      });
      return;
    }

    setIsDecoding(true);
    setDecodedMessage(null);

    // Placeholder for future Python integration
    setTimeout(() => {
        setDecodedMessage("This is a placeholder for the revealed message.");
        toast({ title: 'Success!', description: 'A secret message was found (placeholder).' });
        setIsDecoding(false);
    }, 1000);
  };

  return (
    <Card className={cn("w-full border-2 border-primary/20 shadow-lg", className)}>
      <CardHeader>
        <CardTitle>Decode a Message from Text</CardTitle>
        <CardDescription>Enter text to reveal its hidden secret.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="stego-text">Enter Text to Decode</Label>
          <Textarea
            id="stego-text"
            placeholder="Paste the text that you suspect contains a hidden message..."
            value={stegoText}
            onChange={(e) => setStegoText(e.target.value)}
            className="min-h-[150px]"
          />
        </div>
        
        <Button onClick={handleDecode} disabled={isDecoding || !stegoText} className="w-full text-lg py-6">
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
