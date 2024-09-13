import { useState, useRef, useEffect, useContext } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import 'pdfjs-dist/web/pdf_viewer.css';
import { FaBookOpen, FaStickyNote, FaTimes, FaRegFileAlt } from 'react-icons/fa';
import { AuthContext } from '../../Context/authContext';
import axios from '../../../axiosConfig';

// Set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

const HIGHLIGHTS_KEY_PREFIX = "pdfHighlights_";

const PdfViewer = ({ file, bookId }) => {
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [highlights, setHighlights] = useState({});
  const [selectedText, setSelectedText] = useState("");
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [note, setNote] = useState("");
  const [annotations, setAnnotations] = useState([]);
  const [showColorModal, setShowColorModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");
  const [theme, setTheme] = useState('light');
  const [flashcards, setFlashcards] = useState([]);
  const [showFlashCards, setShowFlashCards] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const pdfContainerRef = useRef(null);
  const selectionTimeout = useRef(null);
  const [highlightApplied, setHighlightApplied] = useState(false);

  const highlightsKey = `${HIGHLIGHTS_KEY_PREFIX}${file}`;

  useEffect(() => {
    const storedHighlights = localStorage.getItem(highlightsKey);
    const storedAnnotations = localStorage.getItem(`${highlightsKey}_annotations`);

    if (storedHighlights) {
      setHighlights(JSON.parse(storedHighlights));
    }

    if (storedAnnotations) {
      setAnnotations(JSON.parse(storedAnnotations));
    }
  }, [highlightsKey]);

  useEffect(() => {
    const fetchAnnotations = async () => {
      try {
        const response = await axios.get(`/pdf/annotations/${currentUser?.userId}/${bookId}`);
        const data = response.data;

        // Transform the data into the required format
        const highlightsData = {};
        const annotationsData = [];

        data.annotations.forEach((annotation) => {
          annotation.highlights.forEach((highlight) => {
            if (!highlight.rect) {
              console.warn(`Highlight is missing rect data:`, highlight);
              return; // Skip this highlight
            }
            if (!highlightsData[pageNumber]) {
              highlightsData[pageNumber] = [];
            }
            highlightsData[pageNumber].push({
              rect: {
                top: highlight.rect.top,
                left: highlight.rect.left,
                width: highlight.rect.width,
                height: highlight.rect.height,
              },
              color: highlight.color,
              text: highlight.text,
            });
          });
          console.log('response', response.data)
          annotationsData.push(...annotation.notes.map((note) => ({
            text: note.text,
            note: note.note,
            pageNumber: note.pageNumber,
            rect: note.rect // Ensure this is correctly included if needed
          })));
          console.log('annotationsData', annotationsData)
        });

        setHighlights(highlightsData);
        setAnnotations(annotationsData);
        setFlashcards(annotationsData);


      } catch (error) {
        console.error('Error fetching annotations:', error);
      }
    };

    fetchAnnotations();
  }, [currentUser?.userId, bookId]);




  const removeDuplicateHighlights = (highlights) => {
    const uniqueHighlights = {};

    Object.keys(highlights).forEach(pageNumber => {
      uniqueHighlights[pageNumber] = highlights[pageNumber].filter((highlight, index, self) =>
        index === self.findIndex((h) =>
          h.rect.top === highlight.rect.top &&
          h.rect.left === highlight.rect.left &&
          h.rect.width === highlight.rect.width &&
          h.rect.height === highlight.rect.height &&
          h.color === highlight.color &&
          h.text === highlight.text
        )
      );
    });

    return uniqueHighlights;
  };

  useEffect(() => {
    const saveAnnotations = async () => {
      try {
        const uniqueHighlights = removeDuplicateHighlights(highlights);
        const payload = {
          userId: currentUser?.userId,
          bookId: bookId,
          highlights: uniqueHighlights,
          annotations // Include notes here
        };
        console.log("Payload for saving annotations:", payload);
        await axios.post(`/pdf/annotations/${bookId}`, payload);
        setHighlightApplied(false); // Reset highlightApplied after saving
      } catch (error) {
        console.error('Error saving annotations:', error);
      }
    };

    if (highlightApplied) {
      saveAnnotations();
    }
  }, [highlightApplied, annotations, highlights, bookId, currentUser?.userId]);



  const saveAnnotations = async () => {

  };
  // useEffect(() => {
  //   localStorage.setItem(highlightsKey, JSON.stringify(highlights));
  //   localStorage.setItem(`${highlightsKey}_annotations`, JSON.stringify(annotations));
  // }, [highlights, annotations, highlightsKey]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const goToNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(prev => prev - 1);
    }
  };

  const truncateText = (text, startWordCount, endWordCount) => {
    const words = text.split(" ");
    if (words.length <= startWordCount + endWordCount) return text;
    return [...words.slice(0, startWordCount), '........', ...words.slice(-endWordCount)].join(" ");
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString().trim();

      if (selectedText.length > 3) {
        setSelectedText(truncateText(selectedText, 15, 5));
        setShowColorModal(true);
      } else {
        setShowColorModal(false); // Optionally, you might want to close the color modal if selection is not valid
      }
    }
  };

  const adjustHighlightPosition = (rect) => {
    const containerRect = pdfContainerRef.current.getBoundingClientRect();
    return {
      top: rect.top - containerRect.top + pdfContainerRef.current.scrollTop,
      left: rect.left - containerRect.left + pdfContainerRef.current.scrollLeft,
      width: rect.width,
      height: rect.height,
    };
  };

  const applyHighlight = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && selectedColor) {
      const range = selection.getRangeAt(0);
      const rects = range.getClientRects();
      const highlightsForPage = Array.from(rects).map(rect => adjustHighlightPosition(rect));
      const newHighlights = highlightsForPage.map(highlight => ({
        rect: highlight,
        color: selectedColor,
        text: selectedText, // Ensure this is set correctly
      }));
      setHighlights(prev => ({
        ...prev,
        [pageNumber]: [
          ...(prev[pageNumber] || []),
          ...newHighlights,
        ],
      }));
      setNoteModalOpen(true);
      setSelectedColor("");
      setHighlightApplied(true);
      // Clear selection after applying highlight
      window.getSelection().removeAllRanges();
    }
  };

  const handleMouseUp = () => {
    if (selectionTimeout.current) {
      clearTimeout(selectionTimeout.current);
    }
    selectionTimeout.current = setTimeout(() => {
      handleTextSelection();
    }, 200);
  };

  const handleMouseDown = () => {
    if (selectionTimeout.current) {
      clearTimeout(selectionTimeout.current);
    }
  };

  const saveNote = () => {
    const newAnnotation = { text: selectedText, note, pageNumber };
    setAnnotations(prev => {
      const updatedAnnotations = [...prev, newAnnotation];
      console.log("Updated annotations:", updatedAnnotations); // Debugging line
      return updatedAnnotations;
    });
    setFlashcards(prev => [
      ...prev,
      { text: selectedText, note, pageNumber }
    ]);
    setNoteModalOpen(false);
    setNote("");
    setHighlightApplied(true); // Trigger saving
  };


  const renderHighlights = () => {
    return (
      <>
        {highlights[pageNumber]?.map((highlight, index) => {
          if (!highlight.rect) {
            console.warn(`Highlight on page ${pageNumber} is missing rect data:`, highlight);
            return null; // Skip rendering this highlight
          }
          return (
            <div
              key={index}
              style={{
                position: "absolute",
                top: highlight.rect.top,
                left: highlight.rect.left,
                width: highlight.rect.width,
                height: highlight.rect.height,
                backgroundColor: highlight.color,
                pointerEvents: "none",
                opacity: 0.4,
              }}
            />
          );
        })}
        {annotations.filter(annotation => annotation.pageNumber === pageNumber).map((annotation, index) => {
          // Make sure rect data is available
          if (!annotation.rect) {
            console.warn(`Annotation on page ${pageNumber} is missing rect data:`, annotation);
            return null; // Skip rendering this annotation
          }
          return (
            <div
              key={index}
              style={{
                position: "absolute",
                top: annotation.rect.top, // Ensure this is set correctly
                left: annotation.rect.left,
                backgroundColor: 'rgba(255, 255, 0, 0.5)', // Example styling for notes
                padding: '4px',
                borderRadius: '4px',
              }}
            >
              <p>{annotation.text}</p>
              <p>{annotation.note}</p>
            </div>
          );
        })}
      </>
    );
  };
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : theme === 'sepia' ? 'bg-[#5b4636] text-black' : 'bg-gray-100 text-black'} transition-colors duration-300`}>

      <div className="bg-white shadow-md z-50">
        <div className="flex justify-between items-center p-4 max-w-5xl mx-auto">
          <div className="flex items-center space-x-4">

          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => handleThemeChange('light')} className="px-4 py-2 bg-gray-200 text-gray-900 rounded">Light</button>
            <button onClick={() => handleThemeChange('dark')} className="px-4 py-2 bg-gray-800 text-white rounded">Dark</button>
            <button onClick={() => handleThemeChange('sepia')} className="px-4 py-2 bg-[#5b4636] text-white rounded">Sepia</button>
          </div>
          <button
            onClick={() => setShowFlashCards(!showFlashCards)}
            className="px-4 py-2 bg-green-500 text-white rounded "
          >
            {showFlashCards ? <FaBookOpen /> : <FaStickyNote />}
          </button>
        </div>
      </div>

      <div
        className="relative flex flex-col items-center p-4 pt-10 min-h-screen"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <div
          className="relative md:w-4xl w-xl  overflow-hidden" // Adjust max-width as needed
          ref={pdfContainerRef}
        >
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error) => console.error("Error loading PDF:", error)}
          >
            <Page
              pageNumber={pageNumber}
              renderTextLayer
              renderAnnotationLayer
              // Adjust these values for scaling
              width={window.innerWidth <= 768 ? window.innerWidth * 1: Math.min(window.innerWidth * 0.7, 1200)} // Responsive scaling for mobile (95% width) // Example: 90% of the viewport width
              
            />
          </Document>

          {renderHighlights()}
        </div>

        {showColorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-100 p-4 rounded-md shadow-lg w-full max-w-xs md:max-w-md lg:max-w-1/3 mx-4">
              <h2 className="text-lg font-bold mb-4 text-center">Select Highlight Color</h2>
              <div className="flex justify-center space-x-2 md:space-x-4">
                {['yellow', 'green', 'blue', 'pink', 'red'].map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 ${color === selectedColor ? 'border-black' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <button
                  className="px-3 py-1 md:px-4 md:py-2 bg-blue-500 text-white rounded mr-2"
                  onClick={() => {
                    applyHighlight();
                    setShowColorModal(false);
                  }}
                >
                  Highlight
                </button>
                <button
                  className="px-3 py-1 md:px-4 md:py-2 bg-gray-500 text-white rounded"
                  onClick={() => setShowColorModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}


        {noteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-md shadow-lg w-1/2">
              <h2 className="text-lg font-bold mb-4">Add a Note</h2>
              <p className="mb-4 text-gray-900">
                Selected Text: {(selectedText)}
              </p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded mb-4"
              />
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
                  onClick={saveNote}
                >
                  Save
                </button>
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                  onClick={() => setNoteModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}


        <div
          className={`fixed inset-0 z-50 flex justify-end bg-black bg-opacity-30 transform transition-transform duration-300 ease-in-out ${showFlashCards ? "translate-x-0" : "translate-x-full"}`}
          onClick={() => setShowFlashCards(false)} // Close when clicking outside
        >
          {/* Flashcards Panel */}
          <div
            className="relative bg-white md:w-[450px] w-[280px] p-4 h-full shadow-2xl overflow-auto"
            onClick={(e) => e.stopPropagation()} // Prevent click on flashcards panel from closing
          >
            {/* Cross Mark (Close Button) */}
            <FaTimes
              className="absolute top-4 left-4 mt-2 hover:text-red-800 text-red-600 cursor-pointer"
              onClick={() => setShowFlashCards(false)}
            />
            <h2 className="text-2xl font-bold mt-2 mb-4 text-gray-800 text-center">Flash Cards</h2>
            <ul>
              {flashcards.length > 0 ? (
                flashcards.map((flashcard, index) => (
                  <li
                    key={index}
                    className="bg-gray-100 rounded-lg shadow-md p-4 mb-4 transition-all hover:shadow-lg"
                  >
                    <div className="flex items-center space-x-4 mb-2">
                      <FaRegFileAlt className="text-blue-500" />
                      <p className="font-semibold text-gray-600">Selected text:</p>
                    </div>
                    <p className="italic text-gray-700">{truncateText(flashcard.text, 15, 5)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex space-x-2 items-center">
                        <FaStickyNote className="text-yellow-500" />
                        <p className="font-semibold text-gray-600">Notes:</p>
                        <div
                          className="cursor-pointer underline text-blue-500 hover:text-blue-700"
                          onClick={() => {
                            setPageNumber(flashcard.pageNumber);
                            setShowFlashCards(false); // Close flashcards after selection
                          }}
                        >
                          <div className="font-bold">{flashcard.note}</div>
                        </div>
                      </div>
                      <div
                        className="text-gray-600 cursor-pointer hover:text-gray-800"
                        onClick={() => {
                          setPageNumber(flashcard.pageNumber);
                          setShowFlashCards(false); // Navigate to the selected page
                        }}
                      >
                        Page: {flashcard.pageNumber}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-center text-gray-500">No flashcards available.</p>
              )}
            </ul>
            <button
              onClick={() => setShowFlashCards(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded-full mt-4 hover:bg-blue-600 transition-colors"
            >
              Close Flash Cards
            </button>
          </div>
        </div>

        <div className="flex justify-between w-full px-4 py-2 ">
          <button
            onClick={goToPrevPage}
            className="px-4 py-2 bg-blue-500 text-white rounded"
            disabled={pageNumber <= 1}
          >
            Previous
          </button>
          <span className="bg-gray-300 rounded-md mt-3">
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={goToNextPage}
            className="px-4 py-2 bg-blue-500 text-white rounded"
            disabled={pageNumber >= numPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
