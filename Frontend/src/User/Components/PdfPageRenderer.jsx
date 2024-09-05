import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'; // Import for annotations if needed

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PdfViewerComponent = ({ pdfUrl }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handlePreviousPage = () => {
        setPageNumber(prevPage => Math.max(prevPage - 1, 1));
    };

    const handleNextPage = () => {
        setPageNumber(prevPage => Math.min(prevPage + 1, numPages));
    };

    return (
        <div className="pdf-viewer">
            <div className="pdf-header">
                <h2>Book Title</h2>
                <div className="pdf-controls">
                    <button onClick={handlePreviousPage} disabled={pageNumber <= 1}>
                        Previous
                    </button>
                    <button onClick={handleNextPage} disabled={pageNumber >= numPages}>
                        Next
                    </button>
                </div>
            </div>
            <div className="pdf-content">
                <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                >
                    <Page pageNumber={pageNumber} />
                </Document>
            </div>
        </div>
    );
};

export default PdfViewerComponent;
