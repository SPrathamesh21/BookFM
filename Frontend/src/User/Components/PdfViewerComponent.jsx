import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import pdfFile from '../../assets/Book6(271pg).pdf';

// Set the worker source for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = '/src/assets/pdf.worker.min.mjs';

const PdfViewerComponent = () => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.5); // Default scale
    const [darkMode, setDarkMode] = useState(false);
    const [columns, setColumns] = useState(1); // Default to one column
    const containerRef = useRef(null);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth;
                setScale(containerWidth / 1600); // Adjust this value if needed
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial calculation

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const progressPercentage = numPages ? ((pageNumber / numPages) * 100).toFixed(2) : 0;

    const zoomIn = () => {
        setScale(prevScale => Math.min(prevScale * 1.2, 3)); // Zoom in with a maximum limit
    };

    const zoomOut = () => {
        setScale(prevScale => Math.max(prevScale / 1.2, 0.5)); // Zoom out with a minimum limit
    };

    const handlePreviousPage = () => {
        setPageNumber(prevPage => Math.max(prevPage - 1, 1));
    };

    const handleNextPage = () => {
        setPageNumber(prevPage => Math.min(prevPage + 1, numPages));
    };

    const getPageContainerWidth = () => {
        switch (columns) {
            case 2:
                return '50%';
            case 3:
                return '33.33%';
            default:
                return '100%';
        }
    };

    return (
        <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
            <div className={`flex justify-between items-center p-4 border-b ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>
                <h2 className={`text-xl font-bold`}>Book Title</h2>
                <div className="flex items-center space-x-4">
                    <button 
                        className={`text-blue-500 hover:text-blue-700 ${darkMode ? 'dark:text-blue-300 dark:hover:text-blue-500' : ''}`}
                        onClick={() => setDarkMode(!darkMode)}
                    >
                        Toggle Dark Mode
                    </button>
                    <button
                        className={`bg-gray-300 text-black py-2 px-4 rounded hover:bg-gray-400 ${darkMode ? 'dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500' : ''}`}
                        onClick={zoomOut}
                    >
                        Zoom Out
                    </button>
                    <button
                        className={`bg-gray-300 text-black py-2 px-4 rounded hover:bg-gray-400 ${darkMode ? 'dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500' : ''}`}
                        onClick={zoomIn}
                    >
                        Zoom In
                    </button>
                    <select
                        className={`bg-gray-200 text-black py-2 px-4 rounded ${darkMode ? 'dark:bg-gray-700 dark:text-white' : ''}`}
                        value={columns}
                        onChange={(e) => setColumns(Number(e.target.value))}
                    >
                        <option value={1}>1 Column</option>
                        <option value={2}>2 Columns</option>
                        <option value={3}>3 Columns</option>
                    </select>
                </div>
                <button 
                    className={`text-red-500 hover:text-red-700 ${darkMode ? 'dark:text-red-300 dark:hover:text-red-500' : ''}`}
                    onClick={() => alert('Close PDF')}
                >
                    Close
                </button>
            </div>
            <div className={`flex-1 overflow-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`} ref={containerRef}>
                <Document
                    file={pdfFile}
                    onLoadSuccess={onDocumentLoadSuccess}
                >
                    <div className={`flex ${columns > 1 ? 'flex-wrap' : 'justify-center'}`} style={{ justifyContent: columns > 1 ? 'center' : 'flex-start' }}>
                        {[...Array(columns).keys()].map((colIndex) => (
                            <div
                                key={colIndex}
                                className={`pdf-page-container ${columns > 1 ? `w-${getPageContainerWidth()}` : 'w-full'} flex justify-center`}
                            >
                                <Page
                                    pageNumber={pageNumber + colIndex}
                                    scale={scale}
                                    className="pdf-page"
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />
                            </div>
                        ))}
                    </div>
                </Document>
            </div>
            <div className={`sticky bottom-0 p-4 ${darkMode ? 'bg-gray-800 border-t border-gray-600' : 'bg-gray-100 border-t border-gray-300'}`}>
                <div className="flex justify-between items-center mb-2">
                    <button
                        className={`bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed ${darkMode ? 'dark:bg-blue-700 dark:hover:bg-blue-800 dark:disabled:bg-gray-600' : ''}`}
                        onClick={handlePreviousPage}
                        disabled={pageNumber <= 1}
                    >
                        Previous
                    </button>
                    <p className={`text-center`}>
                        Page {pageNumber} of {numPages || '-'}
                    </p>
                    <button
                        className={`bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed ${darkMode ? 'dark:bg-blue-700 dark:hover:bg-blue-800 dark:disabled:bg-gray-600' : ''}`}
                        onClick={handleNextPage}
                        disabled={pageNumber >= numPages}
                    >
                        Next
                    </button>
                </div>
                <div className={`w-full bg-gray-200 rounded h-2 mb-2 ${darkMode ? 'bg-gray-600' : ''}`}>
                    <div
                        className="bg-blue-500 h-full rounded"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                <p className={`text-center`}>{progressPercentage}%</p>
            </div>
        </div>
    );
};

export default PdfViewerComponent;


