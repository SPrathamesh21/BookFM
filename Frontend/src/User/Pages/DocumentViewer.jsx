import React from 'react';
import { useLocation } from 'react-router-dom';
import PdfViewerComponent from '../Components/PdfViewerComponent';
import EpubViewerComponent from '../Components/EpubViewerComponent';

const DocumentViewer = () => {
  const location = useLocation();
  const { fileUrl, fileType, BookID } = location.state || {};

  const reconstructBlobUrl = (base64) => {
    const byteString = atob(base64.split(',')[1]);
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    return URL.createObjectURL(blob);
  };

  const base64 = localStorage.getItem('epubFileData');
  const fileUrlFromStorage = base64 ? reconstructBlobUrl(base64) : fileUrl;

  return (
    <div>
      {fileUrlFromStorage && fileType === 'pdf' && <PdfViewerComponent file={fileUrlFromStorage} bookId={BookID} />}
      {fileUrlFromStorage && fileType === 'epub' && <EpubViewerComponent file={fileUrlFromStorage} bookId={BookID} />}
      {!fileUrlFromStorage && <p>No file to display</p>}
    </div>
  );
};

export default DocumentViewer;
