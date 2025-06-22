
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
                 <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mt-12 mb-8 font-serif tracking-wide text-center break-words">
                    Image Steganography
                </h1>
                
                <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    <Tabs defaultValue="encode" className="w-full flex flex-col">
                      <TabsList className="grid w-full grid-cols-2 mb-4 shrink-0">
                        <TabsTrigger value="encode">Encode</TabsTrigger>
                        <TabsTrigger value="decode">Decode</TabsTrigger>
                      </TabsList>
                      <TabsContent value="encode" className="flex-grow">
                        <EncodePanel className="h-full" />
                      </TabsContent>
                      <TabsContent value="decode" className="flex-grow">
                        <DecodePanel className="h-full" />
                      </TabsContent>
                    </Tabs>
                    <div className="flex items-center justify-center">
                        <Image
                            src="/image-steganography.jpg"
                            alt="Steganography process illustration"
                            width={400}
                            height={400}
                            className="object-cover rounded-md shadow-[0_0_25px_3px_hsl(var(--primary)/0.4)]"
                            data-ai-hint="digital security"
                        />
                    </div>
                </div>
            </main>

            <AppFooter />
        </div>
    );
}
