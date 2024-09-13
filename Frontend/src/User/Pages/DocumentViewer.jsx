import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PdfViewerComponent from '../Components/PdfViewerComponent';
import EpubViewerComponent from '../Components/EpubViewerComponent';
import { getFileFromIndexedDB } from '../../Utils/IndexDBHelper'; // Import helper function

const DocumentViewer = () => {
  const location = useLocation();
  const { fileUrl, fileType, BookID } = location.state || {};

  const [fileUrlFromStorage, setFileUrlFromStorage] = useState(null);
  const [localFileType, setLocalFileType] = useState(null);

  // Helper function to reconstruct Blob URL from base64
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

  useEffect(() => {
    const fetchFileFromIndexedDB = async () => {
      try {
        // Retrieve the file and file type from IndexedDB
        const base64 = await getFileFromIndexedDB('epubFileData');
        const storedFileType = await getFileFromIndexedDB('fileType');

        if (base64 && storedFileType) {
          const blobUrl = reconstructBlobUrl(base64);
          setFileUrlFromStorage(blobUrl);
          setLocalFileType(storedFileType);
        } else {
          // Fallback to URL from location.state if IndexedDB has no file
          setFileUrlFromStorage(fileUrl);
          setLocalFileType(fileType);
        }
      } catch (error) {
        console.error('Error fetching file from IndexedDB:', error);
      }
    };

    fetchFileFromIndexedDB();
  }, [fileUrl, fileType]);

  return (
    <div>
      {fileUrlFromStorage && localFileType === 'pdf' && (
        <PdfViewerComponent file={fileUrlFromStorage} bookId={BookID} />
      )}
      {fileUrlFromStorage && localFileType === 'epub' && (
        <EpubViewerComponent file={fileUrlFromStorage} bookId={BookID} />
      )}
      {!fileUrlFromStorage && <p>No file to display</p>}
    </div>
  );
};

export default DocumentViewer;
