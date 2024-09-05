import React, { useState } from 'react';
import PdfViewerComponent from './PdfViewerComponent'; // Ensure this path is correct
import EpubViewerComponent from './EpubViewerComponent'; // Ensure this path is correct

const DocumentViewer = () => {
    const [fileType, setFileType] = useState(null); // Null initially
    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            // Determine file type
            const type = selectedFile.type.includes('pdf') ? 'pdf' : 'epub';
            setFile(URL.createObjectURL(selectedFile));
            setFileType(type);
        }
    };

    return (
        <div>
            <input type="file" accept=".pdf, .epub" onChange={handleFileChange} />
            {file && fileType === 'pdf' && (
                <PdfViewerComponent file={file} />
            )}
            {file && fileType === 'epub' && (
                <EpubViewerComponent file={file} />
            )}
        </div>
    );
};

export default DocumentViewer;
