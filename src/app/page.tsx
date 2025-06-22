"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { AppHeader } from '@/components/header';
import { AppFooter } from '@/components/footer';

export default function Home() {
    return (
        <div className="bg-background text-foreground flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-grow flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-destructive mb-8 font-serif text-center break-words">
                    Welcome to<br/>Steganography!
                </h1>
                <div className="max-w-3xl space-y-6 text-foreground text-lg">
                    <p>
                        Steganography is the practice of representing information within another message or physical object, in such a manner that the presence of the information is not evident to human inspection. In computing/electronic contexts, a computer file, message, image, or video is concealed within another file, message, image, or video.
                        <Button variant="link" asChild className="p-1 text-base align-baseline">
                            <Link href="#">Read more</Link>
                        </Button>
                    </p>
                    <p>
                        This website is open source, free to use Steganography technique for Text, Image, Audio and Video media. Thanks for Exploring/using. 😊
                    </p>
                </div>
            </main>
            <AppFooter />
        </div>
    );
}
