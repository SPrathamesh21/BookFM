import React, { useState, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Document, Page, pdfjs } from 'react-pdf';
import pdf from '../../assets/book12(136pg).pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;

const Pages = React.forwardRef((props, ref) => {
    return (
        <div className="demoPage" ref={ref}>
            {props.children}
            <p className="text-gray-500 text-sm absolute bottom-2 right-4">Page {props.number}</p>
        </div>
    );
});

Pages.displayName = 'Pages';

function Flipbook() {
    const [numPages, setNumPages] = useState();
    const [pageIndex, setPageIndex] = useState(0); // Track the current page
    const bookRef = useRef(); // Reference to the flipbook

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    // Function to go to the previous page
    const goToPrevPage = () => {
        if (pageIndex > 0) {
            setPageIndex(pageIndex - 1);
            bookRef.current.pageFlip().flipPrev(); // Flip to the previous page
        }
    };

    // Function to go to the next page
    const goToNextPage = () => {
        if (pageIndex < numPages - 1) {
            setPageIndex(pageIndex + 1);
            bookRef.current.pageFlip().flipNext(); // Flip to the next page
        }
    };

    return (
        <>
            <div className="h-screen w-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 overflow-hidden">
                <h1 className="text-4xl text-white text-center font-extrabold mb-6">FlipBook Viewer</h1>

                <HTMLFlipBook
                    width={700}
                    height={900}
                    ref={bookRef}
                    className="shadow-2xl rounded-lg overflow-hidden"
                >
                    {
                        [...Array(numPages).keys()].map((pNum) => (
                            <Pages key={pNum} number={pNum + 1}>
                                <Document file={pdf} onLoadSuccess={onDocumentLoadSuccess}>
                                    <Page pageNumber={pNum} width={700} renderAnnotationLayer={false} renderTextLayer={false} />
                                </Document>
                            </Pages>
                        ))
                    }
                </HTMLFlipBook>

                {/* Navigation Buttons */}
                <div className="mt-8 flex space-x-6">
                    <button 
                        onClick={goToPrevPage} 
                        className={`bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg transition-all hover:bg-blue-700 ${
                            pageIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={pageIndex === 0}
                    >
                        Previous Page
                    </button>
                    <button 
                        onClick={goToNextPage} 
                        className={`bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg transition-all hover:bg-blue-700 ${
                            pageIndex >= numPages - 1 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={pageIndex >= numPages - 1}
                    >
                        Next Page
                    </button>
                </div>
            </div>
        </>
    );
}

export default Flipbook;
