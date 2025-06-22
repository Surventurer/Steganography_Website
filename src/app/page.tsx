
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Linkedin, Mail } from 'lucide-react';

const Logo = () => (
    <Link href="/" className="flex items-center space-x-2" aria-label="Steganography Home">
        <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-green-800/60 rounded-sm"></div>
            <span className="absolute inset-0 flex items-center justify-center text-3xl font-serif font-bold text-white">S</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute -right-1.5 -bottom-1.5 text-primary"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
    </Link>
);

const TwitterIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 7.184L18.901 1.153Zm-1.61 19.932h2.527L5.41 2.541H2.713l14.578 18.544Z"/></svg>
);

export default function Home() {
    const navItems = ["HOME", "TEXT", "IMAGE", "AUDIO", "VIDEO", "DEEP DRIVE"];

    return (
        <div className="bg-background text-foreground flex flex-col min-h-screen">
            <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <nav className="flex items-center justify-between">
                    <Logo />
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => (
                            <Button key={item} variant={item === 'HOME' ? 'default' : 'ghost'} asChild size="sm">
                                <Link href={item === 'HOME' ? '/' : `/#${item.toLowerCase()}`}>{item}</Link>
                            </Button>
                        ))}
                    </div>
                </nav>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-5xl sm:text-7xl font-bold text-destructive mb-8 font-serif tracking-wide">
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

            <footer className="border-t border-border/20 mt-12 py-6">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-4">
                    <div className="flex items-center space-x-4">
                        <Link href="#" aria-label="LinkedIn" className="bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-full transition-colors flex items-center justify-center">
                            <Linkedin size={20} />
                        </Link>
                        <Link href="#" aria-label="Twitter" className="bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-full transition-colors flex items-center justify-center">
                            <TwitterIcon />
                        </Link>
                        <Link href="#" aria-label="Email" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground p-2 rounded-full transition-colors flex items-center justify-center">
                            <Mail size={20} />
                        </Link>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © Copyrights 2024 - 2099 Steganography. All Rights Reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
