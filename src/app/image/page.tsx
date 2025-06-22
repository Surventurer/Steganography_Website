"use client";

import Image from 'next/image';
import { EncodePanel } from '@/components/encode-panel';
import { DecodePanel } from '@/components/decode-panel';
import { AppHeader } from '@/components/header';
import { AppFooter } from '@/components/footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ImageSteganographyPage() {
    return (
        <div className="bg-background text-foreground flex flex-col min-h-screen">
            <AppHeader />

            <main className="flex-grow flex flex-col items-center p-4">
                 <h1 className="text-5xl sm:text-7xl font-bold text-foreground mt-12 mb-8 font-serif tracking-wide text-center">
                    Image Steganography
                </h1>
                
                <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <Tabs defaultValue="encode" className="w-full">
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
                    <div className="flex items-center justify-center p-4">
                        <Image
                            src="https://placehold.co/500x500.png"
                            alt="Steganography process illustration"
                            width={500}
                            height={500}
                            className="rounded-lg shadow-xl object-cover"
                            data-ai-hint="digital security"
                        />
                    </div>
                </div>
            </main>

            <AppFooter />
        </div>
    );
}
