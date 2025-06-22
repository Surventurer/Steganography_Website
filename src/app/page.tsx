"use client";

import { Lock, Unlock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EncodePanel } from "@/components/encode-panel";
import { DecodePanel } from "@/components/decode-panel";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-background">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold font-headline text-primary">
            Hideaway
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Hide your secrets in plain sight.
          </p>
        </header>

        <Tabs defaultValue="encode" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="encode" className="h-full text-base gap-2">
              <Lock className="w-5 h-5" /> Encode
            </TabsTrigger>
            <TabsTrigger value="decode" className="h-full text-base gap-2">
              <Unlock className="w-5 h-5" /> Decode
            </TabsTrigger>
          </TabsList>
          <TabsContent value="encode">
            <EncodePanel />
          </TabsContent>
          <TabsContent value="decode">
            <DecodePanel />
          </TabsContent>
        </Tabs>
      </div>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Hideaway. All rights reserved.</p>
      </footer>
    </main>
  );
}
