
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu } from 'lucide-react';

const Logo = () => (
    <Link href="/" className="flex items-center space-x-2" aria-label="Steganography Home">
        <div className="relative w-14 h-14">
            <Image src="/Steganography_Website logo.png" alt="Steganography Logo" fill sizes="56px" priority className="object-contain" />
        </div>
    </Link>
);

export function AppHeader() {
    const navItems = ["HOME", "TEXT", "IMAGE", "AUDIO", "VIDEO", "DEEP DRIVE"];
    const pathname = usePathname();

    const getIsActive = (item: string) => {
        if (item === 'HOME') return pathname === '/';
        return pathname.startsWith(`/${item.toLowerCase().replace(/\s+/g, '-')}`);
    }

    return (
        <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center justify-between">
                <Logo />

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-1">
                    {navItems.map((item) => (
                         <Button
                            key={item}
                            variant={getIsActive(item) ? 'default' : 'ghost'}
                            asChild
                            size="sm"
                        >
                            <Link href={item === 'HOME' ? '/' : `/${item.toLowerCase().replace(/\s+/g, '-')}`}>{item}</Link>
                        </Button>
                    ))}
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-14 h-14">
                                <Menu className="h-8 w-8" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[250px] p-6">
                            <SheetHeader>
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            </SheetHeader>
                             <nav className="flex flex-col space-y-2 mt-6">
                                {navItems.map((item) => (
                                    <SheetClose asChild key={item}>
                                        <Button variant={getIsActive(item) ? 'default' : 'ghost'} asChild className="w-full justify-start">
                                            <Link href={item === 'HOME' ? '/' : `/${item.toLowerCase().replace(/\s+/g, '-')}`}>{item}</Link>
                                        </Button>
                                    </SheetClose>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </header>
    );
}
