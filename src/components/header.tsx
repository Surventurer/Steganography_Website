"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";

const Logo = () => (
    <Link href="/" className="flex items-center space-x-2" aria-label="Steganography Home">
        <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-primary/60 rounded-sm"></div>
            <span className="absolute inset-0 flex items-center justify-center text-3xl font-serif font-bold text-white">S</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute -right-1.5 -bottom-1.5 text-primary"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
    </Link>
);

export function AppHeader() {
    const navItems = ["HOME", "TEXT", "IMAGE", "AUDIO", "VIDEO", "DEEP DRIVE"];
    const pathname = usePathname();

    const getIsActive = (item: string) => {
        if (item === 'HOME') return pathname === '/';
        if (item === 'DEEP DRIVE') return false; // This link doesn't have an active state
        return pathname.startsWith(`/${item.toLowerCase()}`);
    }

    return (
        <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center justify-between">
                <Logo />
                <div className="hidden md:flex items-center space-x-1">
                    {navItems.map((item) => {
                        if (item === 'DEEP DRIVE') {
                            return (
                                <Button
                                    key={item}
                                    variant="ghost"
                                    asChild
                                    size="sm"
                                >
                                    <a href="/deep-drive.pdf" target="_blank" rel="noopener noreferrer">DEEP DRIVE</a>
                                </Button>
                            );
                        }
                        return (
                            <Button
                                key={item}
                                variant={getIsActive(item) ? 'default' : 'ghost'}
                                asChild
                                size="sm"
                            >
                                <Link href={item === 'HOME' ? '/' : `/${item.toLowerCase()}`}>{item}</Link>
                            </Button>
                        )
                    })}
                </div>
            </nav>
        </header>
    );
}
