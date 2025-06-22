"use client";

import Image from 'next/image';
import { AudioEncodePanel } from '@/components/audio-encode-panel';
import { AudioDecodePanel } from '@/components/audio-decode-panel';
import { AppHeader } from '@/components/header';
import { AppFooter } from '@/components/footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AudioSteganographyPage() {
    return (
        <div className="bg-background text-foreground flex flex-col min-h-screen">
            <AppHeader />

            <main className="flex-grow flex flex-col items-center p-4">
                 <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mt-12 mb-8 font-serif tracking-wide text-center break-words">
                    Audio Steganography
                </h1>
                
                <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    <Tabs defaultValue="encode" className="w-full flex flex-col">
                      <TabsList className="grid w-full grid-cols-2 mb-4 shrink-0">
                        <TabsTrigger value="encode">Encode</TabsTrigger>
                        <TabsTrigger value="decode">Decode</TabsTrigger>
                      </TabsList>
                      <TabsContent value="encode" className="flex-grow">
                        <AudioEncodePanel className="h-full" />
                      </TabsContent>
                      <TabsContent value="decode" className="flex-grow">
                        <AudioDecodePanel className="h-full" />
                      </TabsContent>
                    </Tabs>
                    <div className="relative rounded-lg shadow-xl overflow-hidden min-h-[500px]">
                        <Image
                            src="https://placehold.co/500x500.png"
                            alt="Audio steganography illustration"
                            fill
                            className="object-cover"
                            data-ai-hint="audio waves sound"
                        />
                    </div>
                </div>
            </main>

            <AppFooter />
        </div>
    );
}
