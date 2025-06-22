"use client";

import { EncodePanel } from '@/components/encode-panel';
import { DecodePanel } from '@/components/decode-panel';
import { AppHeader } from '@/components/header';
import { AppFooter } from '@/components/footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ImageSteganographyPage() {
    return (
        <div className="bg-background text-foreground flex flex-col min-h-screen">
            <AppHeader />

            <main className="flex-grow flex flex-col items-center text-center p-4">
                 <h1 className="text-5xl sm:text-7xl font-bold text-foreground mt-12 mb-8 font-serif tracking-wide">
                    Image Steganography
                </h1>
                
                <Tabs defaultValue="encode" className="w-full max-w-6xl">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="encode">Encode</TabsTrigger>
                    <TabsTrigger value="decode">Decode</TabsTrigger>
                  </TabsList>
                  <TabsContent value="encode">
                    <EncodePanel />
                  </TabsContent>
                  <TabsContent value="decode">
                    <DecodePanel />
                  </TabsContent>
                </Tabs>
            </main>

            <AppFooter />
        </div>
    );
}
