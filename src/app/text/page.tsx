"use client";

import Image from 'next/image';
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
                
                <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    <Tabs defaultValue="encode" className="w-full flex flex-col">
                      <TabsList className="grid w-full grid-cols-2 mb-4 shrink-0">
                        <TabsTrigger value="encode">Encode</TabsTrigger>
                        <TabsTrigger value="decode">Decode</TabsTrigger>
                      </TabsList>
                      <TabsContent value="encode" className="flex-grow">
                        <TextEncodePanel className="h-full" />
                      </TabsContent>
                      <TabsContent value="decode" className="flex-grow">
                        <TextDecodePanel className="h-full" />
                      </TabsContent>
                    </Tabs>
                    <div className="relative rounded-lg shadow-xl overflow-hidden min-h-[500px]">
                        <Image
                            src="https://placehold.co/500x500.png"
                            alt="Text steganography illustration"
                            fill
                            className="object-cover"
                            data-ai-hint="text document"
                        />
                    </div>
                </div>
            </main>

            <AppFooter />
        </div>
    );
}
