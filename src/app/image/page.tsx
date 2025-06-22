"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { EncodePanel } from '@/components/encode-panel';
import { DecodePanel } from '@/components/decode-panel';
import { AppHeader } from '@/components/header';
import { AppFooter } from '@/components/footer';

export default function ImageSteganographyPage() {
    const [mode, setMode] = useState<'encode' | 'decode' | null>(null);

    const renderContent = () => {
        if (mode === 'encode') {
            return <EncodePanel />;
        }
        if (mode === 'decode') {
            return <DecodePanel />;
        }
        return (
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="flex flex-col items-center justify-center space-y-8">
                    <Button onClick={() => setMode('encode')} size="lg" className="w-40">Encode</Button>
                    <Button onClick={() => setMode('decode')} size="lg" className="w-40">Decode</Button>
                </div>
                <div className="flex justify-center">
                    <Image
                        src="https://placehold.co/500x500.png"
                        alt="Steganography illustration"
                        width={500}
                        height={500}
                        className="rounded-lg shadow-2xl"
                        data-ai-hint="spy abstract illustration"
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="bg-background text-foreground flex flex-col min-h-screen">
            <AppHeader />

            <main className="flex-grow flex flex-col items-center justify-center text-center p-4">
                 <h1 className="text-5xl sm:text-7xl font-bold text-foreground mb-12 font-serif tracking-wide">
                    Image Steganography
                </h1>
                
                <div className="w-full max-w-6xl p-4">
                  {renderContent()}
                </div>

                {mode && (
                  <Button onClick={() => setMode(null)} variant="link" className="mt-8">
                    Back
                  </Button>
                )}
            </main>

            <AppFooter />
        </div>
    );
}
