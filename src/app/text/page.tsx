"use client";

import { TextEncodePanel } from '@/components/text-encode-panel';
import { TextDecodePanel } from '@/components/text-decode-panel';
import { AppHeader } from '@/components/header';
import { AppFooter } from '@/components/footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TextSteganographyPage() {
    return (
        <div className="bg-background text-foreground flex flex-col min-h-screen">
            <AppHeader />

            <main className="flex-grow flex flex-col items-center p-4">
                 <h1 className="text-5xl sm:text-7xl font-bold text-foreground mt-12 mb-8 font-serif tracking-wide text-center">
                    Text Steganography
                </h1>
                
                <div className="w-full max-w-7xl">
                    <Tabs defaultValue="encode" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="encode">Encode</TabsTrigger>
                        <TabsTrigger value="decode">Decode</TabsTrigger>
                      </TabsList>
                      <TabsContent value="encode">
                        <TextEncodePanel />
                      </TabsContent>
                      <TabsContent value="decode">
                        <TextDecodePanel />
                      </TabsContent>
                    </Tabs>
                </div>
            </main>

            <AppFooter />
        </div>
    );
}
