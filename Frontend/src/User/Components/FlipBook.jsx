import React, { useState, useRef, useEffect, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Document, Page, pdfjs } from 'react-pdf';
import pdf from '../../assets/book11(408pg).pdf';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../../../src/App.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;

const Pages = React.memo(React.forwardRef((props, ref) => (
    <div className="demoPage" ref={ref}>
        {props.children}
        {props.number && <p className="text-gray-500 text-sm absolute bottom-2 right-4">Page {props.number}</p>}
    </div>
)));
Pages.displayName = 'Pages';

const Loader = () => (
    <div className="flex items-center justify-center h-full">
        <div className="loader">Loading...</div>
    </div>
);

const CoverPage = () => (
    <div className="flex items-center justify-center h-full bg-gray-800">
        <div className="text-center">
            <h1 className="text-white text-5xl font-bold mb-4">Book Title</h1>
            <h2 className="text-white text-3xl">Author Name</h2>
        </div>
    </div>
);

function Flipbook() {
    const [numPages, setNumPages] = useState(0);
    const [pageIndex, setPageIndex] = useState(0);
    const [pdfLoaded, setPdfLoaded] = useState(false);
    const bookRef = useRef(null);

    const handleResize = useCallback(() => {
        if (bookRef.current) {
            bookRef.current.pageFlip().update();
        }
    }, []);
    

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    const onDocumentLoadSuccess = useCallback(({ numPages }) => {
        setNumPages(numPages);
        setPdfLoaded(true);
    }, []);

    const goToPrevPage = useCallback(() => {
        if (pageIndex > 0) {
            setPageIndex(pageIndex - 1);
            bookRef.current.pageFlip().flipPrev();
        }
    }, [pageIndex]);

    const goToNextPage = useCallback(() => {
        if (pageIndex < numPages - 1) {
            setPageIndex(pageIndex + 1);
            bookRef.current.pageFlip().flipNext();
        }
    }, [pageIndex, numPages]);

    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024;

    return (
        <div className={`h-full w-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 overflow-hidden relative ${isMobile ? 'overflow-y-scroll' : ''}`}>
            <h1 className="text-4xl text-white text-center font-extrabold mb-6">FlipBook Viewer</h1>
    
            {pdfLoaded ? (
                <HTMLFlipBook
                    width={isMobile ? window.innerWidth : isTablet ? 800 : 700}
                    height={isMobile ? window.innerHeight : isTablet ? 1100 : 1000}
                    ref={bookRef}
                    className={`shadow-2xl rounded-lg overflow-hidden ${isMobile ? 'singlePage' : ''}`}
                    showCover={true}
                >
                    <Pages key="cover">
                        <CoverPage />
                    </Pages>

                    {[...Array(numPages).keys()].map((pNum) => (
    <Pages key={`page-${pNum}`}>
        <Document file={pdf} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={pNum + 1} width={isMobile ? window.innerWidth : isTablet ? 800 : 700} renderAnnotationLayer={false} renderTextLayer={false} />
        </Document>
    </Pages>
))}

    
                    <Pages key="end">
                        <div className="flex items-center justify-center h-full bg-gray-800">
                            <h2 className="text-white text-4xl font-bold">End of Book</h2>
                        </div>
                    </Pages>
                </HTMLFlipBook>
            ) : (
                <Loader />
            )}

            <Document file={pdf} onLoadSuccess={onDocumentLoadSuccess} loading="Loading PDF..." />
    
            <div className={`absolute inset-y-0 left-0 flex items-center pl-4 ${isMobile ? 'hidden' : ''}`}>
                <button 
                    onClick={goToPrevPage} 
                    className={`bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center transition-all hover:bg-blue-700 hover:scale-105 transform duration-200 ${
                        pageIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={pageIndex === 0}
                >
                    <FaChevronLeft className="text-2xl" />
                </button>
            </div>

            <div className={`absolute inset-y-0 right-0 flex items-center pr-4 ${isMobile ? 'hidden' : ''}`}>
                <button 
                    onClick={goToNextPage} 
                    className={`bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center transition-all hover:bg-blue-700 hover:scale-105 transform duration-200 ${
                        pageIndex >= numPages - 1 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={pageIndex >= numPages - 1}
                >
                    <FaChevronRight className="text-2xl" />
                </button>
            </div>
        </div>
    );
}

export default Flipbook;
