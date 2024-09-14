import React, { useState, useRef, useEffect, useContext } from 'react';
import { ReactReader, ReactReaderStyle } from 'react-reader';
import { FaTimes, FaStickyNote, FaBookOpen, FaPen, FaRegFileAlt,FaChevronRight,FaSun, FaMoon  } from 'react-icons/fa';
import 'tailwindcss/tailwind.css';
import { AuthContext } from '../../Context/authContext';
import axios from '../../../axiosConfig';

const EpubViewerComponent = ({ file, bookId }) => {
  const [location, setLocation] = useState(null);
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState('light');
  const [fileData, setFileData] = useState(null);
  const [selections, setSelections] = useState([]);
  const [highlightColor, setHighlightColor] = useState('red');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectionCfi, setSelectionCfi] = useState(null);
  const [notes, setNotes] = useState(new Map());
  const [showFlashCards, setShowFlashCards] = useState(false);
  const [showNoteIcon, setShowNoteIcon] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [selectedText, setSelectedText] = useState(''); // Add state for selected text
  const renditionRef = useRef(null);
  const highlightRefs = useRef(new Map());
  const { currentUser } = useContext(AuthContext);
  const [flashCardNotes, setFlashCardNotes] = useState(new Map());
  const [flashCardSelections, setFlashCardSelections] = useState(new Map());
  const flashCardRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [locationState, setLocationState] = useState(
    localStorage.getItem(`reader-location-${bookId}`) || 0
  );
  
  const tocRef = useRef([]);
  useEffect(() => {
    if (file && typeof file === 'string' && file.startsWith('blob:')) {
      fetch(file)
        .then((response) => response.blob())
        .then((blob) => {
          setFileData(blob);
        })
        .catch((error) => {
          console.error('Error fetching the Blob from URL:', error);
        });
    } else if (file instanceof Blob) {
      setFileData(file);
    } else {
      console.error('File is not a Blob. Ensure the file passed is of type Blob or File.');
    }
  }, [file]);

  useEffect(() => {
    if (locationState && fileData) {
      const bookKey = `reader-location-${bookId}`;
      localStorage.setItem(bookKey, locationState);
    }
  }, [locationState, fileData]);
  

  useEffect(() => {
    const fetchAnnotations = async () => {
      try {
        const response = await axios.get(`/annotations/${currentUser?.userId}/${bookId}`);
  
        if (response.status === 200 && response.data) {
          const { highlights, notes } = response.data;
  
          setSelections(highlights);
  
          const filteredNotes = notes
            .filter(note => note.content !== undefined && note.content !== null)
            .map(note => [note.cfiRange, note.content]);
  
          const filteredSelections = highlights
            .map(highlight => [highlight.cfiRange, highlight.selectedText || '']);
  
          setNotes(new Map(filteredNotes));
          setFlashCardNotes(new Map(filteredNotes));
          setFlashCardSelections(new Map(filteredSelections));
          setTimeout(() => {
            reapplyHighlights();
          }, 500);
        } else {
          console.log('No annotations found for this book.');
          setSelections([]);
          setNotes(new Map());
          setFlashCardNotes(new Map());
          setFlashCardSelections(new Map());
        }
      } catch (error) {
        console.error('Error fetching annotations:', error);
      }
    };
  
    fetchAnnotations();
  }, [bookId, currentUser?.userId]);

  const handleFontSizeChange = (increment) => {
    const newSize = fontSize + increment;
    setFontSize(newSize);
    if (renditionRef.current) {
      renditionRef.current.themes.fontSize(`${newSize}px`);
      reapplyHighlights();
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    if (renditionRef.current) {
      const themes = renditionRef.current.themes;
      const themeConfig = {
        dark: { color: '#d3d3d3', background: '#1a1a1a' },
        light: { color: '#1a1a1a', background: '#d3d3d3' },
        sepia: { color: '#5b4636', background: '#f4ecd8' },
      }[newTheme] || {};
      
      themes.override('color', themeConfig.color || '#1a1a1a');
      themes.override('background', themeConfig.background || '#d3d3d3');
    }
  };

  const locationChanged = (epubcifi) => {
    setLocation(epubcifi);
  };

  const tailwindColorMap = {
    red: '#f87171',
    yellow: '#facc15',
    green: '#4ade80',
    blue: '#60a5fa',
    purple: '#c084fc'
  };

  const reapplyHighlights = () => {
    if (renditionRef.current) {
      const annotations = renditionRef.current.annotations;
      
      // Clear existing highlights
      clearHighlights();
  
      // Reapply highlights if there are selections
      if (selections.length > 0) {
        setTimeout(() => {
          selections.forEach(({ cfiRange, color }) => {
            if (cfiRange) {
              applyHighlight(cfiRange, color);
            }
          });
        }, 500);
      }
    }
  };
  
  // Modify the applyHighlight function to check if a highlight already exists
  const applyHighlight = (cfiRange, color) => {
    if (renditionRef.current) {
      const annotations = renditionRef.current.annotations;
      const highlightId = `${cfiRange}-${color}`;
      const tailwindColor = tailwindColorMap[color];
  
      // Check if the highlight already exists
      if (!highlightRefs.current.has(highlightId)) {
        annotations.add(
          'highlight',
          cfiRange,
          {},
          () => console.log('Highlight clicked:', cfiRange),
          highlightId,
          { fill: tailwindColor, 'fill-opacity': '0.5', 'mix-blend-mode': 'multiply' }
        );
        highlightRefs.current.set(highlightId, cfiRange);
      }
    }
  };
  
  const clearHighlights = () => {
    if (renditionRef.current) {
      const annotations = renditionRef.current.annotations;
      highlightRefs.current.forEach((cfiRange, highlightId) => {
        annotations.remove(cfiRange, 'highlight');
      });
      highlightRefs.current.clear();
    }
  };

  useEffect(() => {
    reapplyHighlights();
  }, [selections]);

  const handleColorSelect = async (color) => {
    setHighlightColor(color);
    if (selectionCfi) {
      try {
        await axios.post(`/annotations/${bookId}`, {
          cfiRange: selectionCfi,
          highlightColor: color,
          bookId: bookId,
          userId: currentUser?.userId
        });
  
        setSelections(prevSelections => [
          ...prevSelections,
          { cfiRange: selectionCfi, color }
        ]);
  
        applyHighlight(selectionCfi, color);
        setShowColorPicker(false);
        setShowNoteIcon(true);
      } catch (error) {
        console.error('Error saving highlight:', error);
      }
    }
  };

  const addNote = () => {
    if (selectionCfi) {
      setNoteModalVisible(true);
    }
  };

  //saving note to database
  const handleSaveNote = async () => {
    if (currentNote && selectionCfi) {
      try {
        await axios.post(`/annotations/${bookId}`, {
          cfiRange: selectionCfi,
          content: currentNote,
          bookId: bookId,
          userId: currentUser?.userId,
          highlightColor: highlightColor,
          selectedText: selectedText // Include selected text here
        });
  
        // Update the notes and selections
        setNotes(prevNotes => new Map(prevNotes).set(selectionCfi, currentNote));
        setFlashCardNotes(prevNotes => new Map(prevNotes).set(selectionCfi, currentNote));
        setFlashCardSelections(prevSelections => new Map(prevSelections).set(selectionCfi, selectedText));
  
        setNoteModalVisible(false);
        setShowNoteIcon(false);
        setCurrentNote('');
      } catch (error) {
        console.error('Error saving note:', error);
      }
    }
  };

  const handleCloseColorPicker = () => {
    setShowColorPicker(false);
    setSelectionCfi(null);
    setShowNoteIcon(false);
  };

  // Capture the selected text
  useEffect(() => {
    if (renditionRef.current) {
      const setRenderSelection = (cfiRange, contents) => {
        setSelectionCfi(cfiRange);
        setSelectedText(contents?.window?.getSelection()?.toString() || ''); 
        setShowColorPicker(true);
        contents.window.getSelection()?.removeAllRanges();
      };
      renditionRef.current.on('selected', setRenderSelection);
      return () => {
        renditionRef.current?.off('selected', setRenderSelection);
      };
    }
  }, [renditionRef.current]);

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
  
    const start = text.slice(0, maxLength / 2);
    const end = text.slice(-maxLength / 2);
  
    return `${start}..... ${end}`;
  };

  //flashcard outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (flashCardRef.current && !flashCardRef.current.contains(event.target)) {
        setShowFlashCards(false);
      }
    }

    if (showFlashCards) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFlashCards, setShowFlashCards]);

  const customReaderStyles = {
    ...ReactReaderStyle,
    readerArea: {
      ...ReactReaderStyle.readerArea,
      position: 'absolute',
      margin:'0px',
      backgroundColor: 'gray',
    },
    arrow:{
      ...ReactReaderStyle.arrow,
      color: 'gray',
    },
    tocArea: {
      ...ReactReaderStyle.tocArea,
      backgroundColor: 'gray',
      color: "white",
      
    },
    tocButtonExpanded: {
      ...ReactReaderStyle.tocButtonExpanded,
      background: 'gray',
      color: 'white',
      zIndex: '999px'
    },
    reader: {
      ...ReactReaderStyle.reader,
      marginLeft: '-50px',
      marginRight: '-50px',
    },
    container:{
      ...ReactReaderStyle.container,
      margin: '0px'
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-gray-100">
      <div className="flex flex-row justify-between items-center p-4 bg-white shadow-md rounded-lg mb-4 w-full mx-auto flex-nowrap">
        {/* Font Size Controls */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => handleFontSizeChange(-2)} 
            className="w-10 h-10 md:px-3 md:py-2 bg-gray-100 text-gray-700 rounded-full shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition duration-150 ease-in-out"
          >
            A-
          </button>
          <span className="text-gray-700 font-medium hidden md:block">Font Size</span>
          <button 
            onClick={() => handleFontSizeChange(2)} 
            className="w-10 h-10 md:px-3 md:py-2 bg-gray-100 text-gray-700 rounded-full shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition duration-150 ease-in-out"
          >
            A+
          </button>
        </div>

        {/* Theme Controls */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => handleThemeChange('light')} 
            className="px-[10px] py-[10px] md:px-4 md:py-2 bg-gray-200 text-gray-800 rounded-full shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 transition duration-150 ease-in-out flex items-center justify-center"
          >
            <FaSun className="w-5 h-5 md:mr-2" />
            <span className="hidden md:inline">Light</span>
          </button>
          <button 
            onClick={() => handleThemeChange('dark')} 
            className="px-[10px] py-[10px] md:px-4 md:py-2 bg-gray-800 text-white rounded-full shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out flex items-center justify-center"
          >
            <FaMoon className="w-5 h-5 md:mr-2" />
            <span className="hidden md:inline">Dark</span>
          </button>
          <button 
            onClick={() => handleThemeChange('sepia')} 
            className="px-[10px] py-[10px] md:px-4 md:py-2 bg-yellow-200 text-yellow-800 rounded-full shadow-sm hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-150 ease-in-out flex items-center justify-center"
          >
            <FaBookOpen className="w-5 h-5 md:mr-2" />
            <span className="hidden md:inline">Sepia</span>
          </button>
        </div>

        {/* Flashcards Toggle */}
        <button 
          onClick={() => setShowFlashCards(!showFlashCards)} 
          className="px-[10px] py-[10px] md:px-4 md:py-2 bg-green-500 text-white rounded-full shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-150 ease-in-out flex items-center justify-center"
        >
          {showFlashCards ? <FaBookOpen className="w-5 h-5" /> : <FaStickyNote className="w-5 h-5" />}
        </button>
      </div>

      {fileData && (
        <div className="w-full h-[80vh] md:h-4/5 relative rounded-lg overflow-hidden">
        {/* Container for ReactReader and current page number */}
        <div className="relative w-full h-full">
          <ReactReader
            url={fileData}
            location={locationState}
            locationChanged={(loc) => {
              locationChanged(loc);
              setLocationState(loc);
      
              if (renditionRef.current && tocRef.current) {
                const { displayed, href } = renditionRef.current.location.start;
                const chapter = tocRef.current.find((item) => item.href === href);
                setCurrentPage(
                  `Page ${displayed.page} of ${displayed.total} in chapter ${
                    chapter ? chapter.label : 'n/a'
                  }`
                );
              }
            }}
            readerStyles={customReaderStyles}
            getRendition={(rendition) => {
              renditionRef.current = rendition;
              rendition.themes.fontSize(`${fontSize}px`);
      
              // Register themes with cleaner background and text colors
              rendition.themes.register('light', { body: { background: '#fdfdfd', color: '#333' } });
              rendition.themes.register('dark', { body: { background: '#1a1a1a', color: '#d3d3d3' } });
              rendition.themes.register('sepia', { body: { background: '#f4ecd8', color: '#5b4636' } });
      
              handleThemeChange(theme); // Apply chosen theme
              reapplyHighlights(); // Reapply highlights after location change
      
              // Listen for Table of Contents changes
              rendition.on('relocated', (location) => {
                const { displayed, href } = rendition.location.start;
                const chapter = tocRef.current.find((item) => item.href === href);
                setCurrentPage(
                  `Page ${displayed.page} of ${displayed.total} in chapter ${
                    chapter ? chapter.label : 'n/a'
                  }`
                );
              });
            }}
            tocChanged={(toc) => (tocRef.current = toc)}
            onError={(error) => console.error('ReactReader Error:', error)}
          />
      
          {/* Display current page number at top-right */}
          {currentPage && (
            <div className="absolute top-2 right-4 p-2 px-4 flex-grow rounded text-white z-10">
              {currentPage}
            </div>
          )}
        </div>
      </div>
      
      )}

      {showColorPicker && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="p-4 bg-white shadow-lg rounded-lg flex flex-col items-center">
            <div className="flex space-x-2 mb-2">
              <div
                className="w-6 h-6 bg-red-400 cursor-pointer rounded-sm"
                onClick={() => handleColorSelect('red')}
              />
              <div
                className="w-6 h-6 bg-yellow-400 cursor-pointer rounded-sm"
                onClick={() => handleColorSelect('yellow')}
              />
              <div
                className="w-6 h-6 bg-green-400 cursor-pointer rounded-sm"
                onClick={() => handleColorSelect('green')}
              />
              <div
                className="w-6 h-6 bg-blue-400 cursor-pointer rounded-sm"
                onClick={() => handleColorSelect('blue')}
              />
              <div
                className="w-6 h-6 bg-purple-400 cursor-pointer rounded-sm"
                onClick={() => handleColorSelect('purple')}
              />
            </div>
            <button
              onClick={handleCloseColorPicker}
              className="mt-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showNoteIcon && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="p-2 bg-yellow-200 shadow-lg rounded-lg flex items-center space-x-4">
            <FaPen
              onClick={addNote}
              className="cursor-pointer text-gray-500"
            />
            <FaTimes
              onClick={() => setShowNoteIcon(false)} 
              className="cursor-pointer text-red-500"
            />
          </div>
        </div>
      )}

      {noteModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="p-4 bg-white shadow-lg rounded-lg flex flex-col items-center w-1/2">
            <h2 className="text-lg font-bold mb-2">Add Note</h2>
            <textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              className="w-full h-32 border border-gray-300 rounded p-2 mb-2"
              placeholder="Enter your note here..."
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={() => setNoteModalVisible(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showFlashCards && (
        <div ref={flashCardRef}  className={`fixed inset-y-0 right-0 z-50 w-96 bg-white shadow-md overflow-auto p-4 transform transition-transform duration-300 ease-in-out ${showFlashCards ? 'translate-x-0' : 'translate-x-full'} rounded-lg`}>
          <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-2">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FaBookOpen className="mr-2 text-gray-600" />
              Flash Cards
            </h2>
            <button 
              onClick={() => setShowFlashCards(false)} 
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
          <ul className="space-y-4">
            {Array.from(flashCardSelections.entries()).map(([cfiRange, selectedText]) => (
              <li 
                key={cfiRange} 
                className="p-5 bg-gray-50 rounded-lg border border-gray-200 shadow-md hover:shadow-lg cursor-pointer transition-shadow duration-150"
                onClick={() => {
                  setLocation(cfiRange); // Navigate to the selected text
                  setShowFlashCards(false); // Close flashcards
                }}
              >
                <div className="mb-3">
                  <div className="text-blue-600 font-semibold flex items-center">
                    <FaRegFileAlt className="mr-2" />
                    Selected text:
                  </div>
                  <div className="text-gray-900">{truncateText(selectedText)}</div>
                </div>
                {flashCardNotes.get(cfiRange) && (
                  <div>
                    <div className="text-yellow-600 font-semibold flex items-center">
                      <FaStickyNote className="mr-2" />
                      Note:
                    </div>
                    <div className="text-gray-900">{flashCardNotes.get(cfiRange)}</div>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <button 
            onClick={() => setShowFlashCards(false)} 
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 flex items-center justify-center"
          >
            <FaChevronRight className="mr-2" />
            Close Flash Cards
          </button>
        </div>
      )}
    </div>
  );
};

export default EpubViewerComponent;
