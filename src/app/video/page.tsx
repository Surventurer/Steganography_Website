
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
                 <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mt-4 mb-8 font-serif text-center break-words">
                    Video Steganography
                </h1>
                
                <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    <Tabs defaultValue="encode" className="w-full flex flex-col">
                      <TabsList className="grid w-full grid-cols-2 mb-4 shrink-0">
                        <TabsTrigger value="encode">Encode</TabsTrigger>
                        <TabsTrigger value="decode">Decode</TabsTrigger>
                      </TabsList>
                      <TabsContent value="encode" className="flex-grow">
                        <VideoEncodePanel className="h-full" />
                      </TabsContent>
                      <TabsContent value="decode" className="flex-grow">
                        <VideoDecodePanel className="h-full" />
                      </TabsContent>
                    </Tabs>
                    <div className="flex items-center justify-center p-4">
                        <Image
                            src="/video-steganography.jpg"
                            alt="Video steganography illustration"
                            width={400}
                            height={400}
                            className="object-cover rounded-md shadow-[0_0_25px_3px_hsl(var(--primary)/0.4)]"
                            data-ai-hint="video reel film"
                        />
                    </div>
                </div>
            </main>

            <AppFooter />
        </div>
    );
}
