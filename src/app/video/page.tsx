"use client";

import Image from 'next/image';
import { VideoEncodePanel } from '@/components/video-encode-panel';
import { VideoDecodePanel } from '@/components/video-decode-panel';
import { AppHeader } from '@/components/header';
import { AppFooter } from '@/components/footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VideoSteganographyPage() {
    return (
        <div className="bg-background text-foreground flex flex-col min-h-screen">
            <AppHeader />

            <main className="flex-grow flex flex-col items-center p-4">
                 <h1 className="text-5xl sm:text-7xl font-bold text-foreground mt-12 mb-8 font-serif tracking-wide text-center">
                    Video Steganography
                </h1>
                
                <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <Tabs defaultValue="encode" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="encode">Encode</TabsTrigger>
                        <TabsTrigger value="decode">Decode</TabsTrigger>
                      </TabsList>
                      <TabsContent value="encode">
                        <VideoEncodePanel />
                      </TabsContent>
                      <TabsContent value="decode">
                        <VideoDecodePanel />
                      </TabsContent>
                    </Tabs>
                    <div className="relative rounded-lg shadow-xl overflow-hidden min-h-[500px]">
                        <Image
                            src="https://placehold.co/500x500.png"
                            alt="Video steganography illustration"
                            fill
                            className="object-cover"
                            data-ai-hint="video reel film"
                        />
                    </div>
                </div>
            </main>

            <AppFooter />
        </div>
    );
}
