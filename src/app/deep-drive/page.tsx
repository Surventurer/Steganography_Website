
"use client";

import { useState, useEffect, useRef } from 'react';
import { AppHeader } from '@/components/header';
import { AppFooter } from '@/components/footer';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2, AlertCircle } from 'lucide-react';

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure the worker to render the PDF from a CDN to avoid pathing issues.
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;


export default function DeepDrivePage() {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [containerWidth, setContainerWidth] = useState<number | undefined>();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Effect to handle container resizing
    useEffect(() => {
        if (!isClient) return;

        const handleResize = () => {
            if (containerRef.current) {
                // Set width for the PDF Page component based on its container
                setContainerWidth(containerRef.current.clientWidth);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Set initial size

        return () => window.removeEventListener('resize', handleResize);
    }, [isClient]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
        setIsLoading(false);
        setError(null);
    }

    function onDocumentLoadError(error: Error): void {
        setError('Failed to load PDF file. Please ensure "deep-drive.pdf" is in the public folder.');
        setIsLoading(false);
        console.error("PDF Load Error:", error);
    }

    return (
        <div className="bg-background text-foreground flex flex-col min-h-screen">
            <AppHeader />

            <main className="flex-grow flex flex-col items-center p-4">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mt-4 mb-8 font-serif text-center break-words">
                    Deep Drive
                </h1>
                
                <div className="w-full max-w-4xl border rounded-lg shadow-lg">
                    <div ref={containerRef} className="bg-muted p-4 flex items-center justify-center min-h-[500px]">
                       {(isLoading || !isClient) && (
                           <div className="flex flex-col items-center gap-4 p-8 text-muted-foreground">
                               <Loader2 className="h-8 w-8 animate-spin" />
                               <p>Loading Document...</p>
                           </div>
                       )}
                       {isClient && error && !isLoading && (
                           <div className="flex flex-col items-center gap-4 p-8 text-destructive">
                               <AlertCircle className="h-8 w-8" />
                               <p>{error}</p>
                           </div>
                       )}
                       {isClient && !error && containerWidth && (
                           <Document
                               file="/deep-drive.pdf"
                               onLoadSuccess={onDocumentLoadSuccess}
                               onLoadError={onDocumentLoadError}
                               className={isLoading ? 'hidden' : ''}
                           >
                               {Array.from(new Array(numPages), (el, index) => (
                                   <Page
                                       key={`page_${index + 1}`}
                                       pageNumber={index + 1}
                                       renderTextLayer={false}
                                       renderAnnotationLayer={false}
                                       className="mb-4"
                                       width={containerWidth}
                                   />
                               ))}
                           </Document>
                       )}
                    </div>
                </div>
            </main>

            <AppFooter />
        </div>
    );
}
