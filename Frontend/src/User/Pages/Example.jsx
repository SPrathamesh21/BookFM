import React, { useState, useEffect, useRef } from 'react';
import { Drawer, Button, Typography, Box, AppBar, Toolbar, IconButton, Slider, TextField } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TableChartIcon from '@mui/icons-material/TableChart'; 
import ePub from 'epubjs';

const EpubReader = () => {
    const [book, setBook] = useState(null);
    const [rendition, setRendition] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [progress, setProgress] = useState(0);
    const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
    const [tocDrawerOpen, setTocDrawerOpen] = useState(false);
    const [toc, setToc] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(0);
    const containerRef = useRef(null);

    const modes = {
        night: { backgroundColor: '#000000', fontColor: '#ffffff' },
        sepia: { backgroundColor: '#f4ecd8', fontColor: '#5b4636' },
        white: { backgroundColor: '#ffffff', fontColor: '#000000' }
    };

    const [settings, setSettings] = useState({
        backgroundColor: modes.white.backgroundColor,
        fontColor: modes.white.fontColor,
        fontFamily: 'serif',
        fontSize: '16px',
        columnCount: 1
    });

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const book = ePub(e.target.result);
                setBook(book);
            };
            reader.readAsArrayBuffer(file);
        }
    };

    useEffect(() => {
        if (book && containerRef.current) {
            const rendition = book.renderTo(containerRef.current, {
                width: '100%',
                height: '100%',
                flow: 'paginated',
            });

            rendition.display().then(async () => {
                setRendition(rendition);

                const cachedLocations = localStorage.getItem('bookLocations');
                if (cachedLocations) {
                    rendition.book.locations.load(cachedLocations);
                } else {
                    await rendition.book.locations.generate(1000);
                    setTotalPages(rendition.book.locations.total);
                    localStorage.setItem('bookLocations', rendition.book.locations.save());
                }

                const location = rendition.currentLocation();
                setCurrentPage(rendition.book.locations.locationFromCfi(location.start.cfi).start);
            });

            rendition.on('relocated', (location) => {
                const currentPage = rendition.book.locations.locationFromCfi(location.start.cfi).start;
                setCurrentPage(currentPage);
                setProgress((currentPage / rendition.book.locations.total) * 100);
            });

            book.loaded.navigation.then(nav => {
                setToc(nav.toc);
            });
        }
    }, [book]);

    useEffect(() => {
        if (rendition) {
            rendition.themes.override('background-color', settings.backgroundColor);
            rendition.themes.override('color', settings.fontColor);
            rendition.themes.override('font-family', settings.fontFamily);
            rendition.themes.override('font-size', settings.fontSize);
            rendition.themes.override('column-count', settings.columnCount);
        }
    }, [settings, rendition]);

    const handleNext = () => {
        if (rendition) rendition.next();
    };

    const handlePrev = () => {
        if (rendition) rendition.prev();
    };

    const handleSettingsChange = (key, value) => {
        setSettings((prev) => ({
            ...prev,
            [key]: value
        }));
    };

    const handleModeChange = (mode) => {
        setSettings({
            backgroundColor: modes[mode].backgroundColor,
            fontColor: modes[mode].fontColor,
            fontFamily: settings.fontFamily,
            fontSize: settings.fontSize,
            columnCount: settings.columnCount
        });
    };

    const handleToCClick = async (href) => {
        if (rendition) {
            await rendition.display(href);
            const location = rendition.currentLocation();
            const currentPage = rendition.book.locations.locationFromCfi(location.start.cfi).start;
            setCurrentPage(currentPage);
        }
    };

    const handleSearch = async () => {
        if (rendition && searchTerm) {
            try {
                const results = await book.search(searchTerm);

                if (results.length > 0) {
                    setSearchResults(results);
                    setCurrentResultIndex(0);
                    await rendition.display(results[0].cfi); // Jump to first result
                    alert(`Found ${results.length} results for "${searchTerm}".`);
                } else {
                    alert('Search term not found in the book.');
                }
            } catch (error) {
                console.error("Error during search:", error);
                alert("Search failed.");
            }
        }
    };

    const handleNextResult = async () => {
        if (searchResults.length > 0) {
            const nextIndex = (currentResultIndex + 1) % searchResults.length;
            setCurrentResultIndex(nextIndex);
            await rendition.display(searchResults[nextIndex].cfi);
        }
    };

    const handlePrevResult = async () => {
        if (searchResults.length > 0) {
            const prevIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
            setCurrentResultIndex(prevIndex);
            await rendition.display(searchResults[prevIndex].cfi);
        }
    };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-gray-100">
      <div className="flex justify-between w-full mb-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => handleFontSizeChange(-2)} className="px-4 py-2 bg-blue-500 text-white rounded">
            A-
          </button>
          <span>Font Size</span>
          <button onClick={() => handleFontSizeChange(2)} className="px-4 py-2 bg-blue-500 text-white rounded">
            A+
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => handleThemeChange('light')} className="px-4 py-2 bg-gray-200 rounded">Light</button>
          <button onClick={() => handleThemeChange('dark')} className="px-4 py-2 bg-gray-800 text-white rounded">Dark</button>
          <button onClick={() => handleThemeChange('sepia')} className="px-4 py-2 bg-yellow-200 rounded">Sepia</button>
        </div>
        <button 
          onClick={() => setShowFlashCards(!showFlashCards)} 
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          {showFlashCards ? <FaBookOpen /> : <FaStickyNote />}
        </button>
      </div>

      <div className="mb-4">
        <input type="file" accept=".epub" onChange={handleFileUpload} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50" />
      </div>

      {fileData && (
        <div className="w-full h-4/5 border rounded overflow-hidden epub-viewer">
          <ReactReader
            url={fileData}
            location={location}
            locationChanged={locationChanged}
            getRendition={(rendition) => {
              renditionRef.current = rendition;
              rendition.themes.fontSize(`${fontSize}px`);
              rendition.themes.register('dark', { body: { background: '#1a1a1a', color: '#d3d3d3' } });
              rendition.themes.register('sepia', { body: { background: '#f4ecd8', color: '#5b4636' } });
              handleThemeChange(theme); 
              reapplyHighlights();
            }}
          />
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
        <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-auto p-4 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Flash Cards</h2>
          <ul>
            {Array.from(notes.entries()).map(([cfiRange, note]) => (
              <li key={cfiRange} className="flex items-center space-x-4 mb-2">
                <FaStickyNote className="text-yellow-500" />
                <div
                  className="cursor-pointer underline"
                  onClick={() => {
                    setLocation(cfiRange); 
                    setShowFlashCards(false);
                  }}
                >
                  {note}
                </div>
              </li>
            ))}
          </ul>
          <button 
            onClick={() => setShowFlashCards(false)} 
            className="px-4 py-2 bg-blue-500 text-white rounded mt-4 self-center"
          >
            Close Flash Cards
          </button>
        </div>
      )}
    </div>
  );
};

export default EpubReader;
