import React, { useState, useRef, useEffect } from 'react';
import { ReactReader } from 'react-reader';
import { FaTimes, FaStickyNote, FaBookOpen, FaPen } from 'react-icons/fa'; 
import 'tailwindcss/tailwind.css';

const EpubReader = () => {
  const [location, setLocation] = useState(null);
  const [fontSize, setFontSize] = useState(16); 
  const [theme, setTheme] = useState('light');
  const [fileData, setFileData] = useState(null);
  const [selections, setSelections] = useState([]);
  const [highlightColor, setHighlightColor] = useState('red'); 
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectionCfi, setSelectionCfi] = useState(null);
  const [notes, setNotes] = useState(new Map()); // To store notes
  const [showFlashCards, setShowFlashCards] = useState(false);
  const [showNoteIcon, setShowNoteIcon] = useState(false); // To show note icon after text selection
  const [noteModalVisible, setNoteModalVisible] = useState(false); // For the note modal
  const [currentNote, setCurrentNote] = useState(''); // For storing the current note text
  const renditionRef = useRef(null);
  const highlightRefs = useRef(new Map()); // To store references to highlights

  // Change Font Size
  const handleFontSizeChange = (increment) => {
    const newSize = fontSize + increment;
    setFontSize(newSize);
    if (renditionRef.current) {
      renditionRef.current.themes.fontSize(`${newSize}px`);
      reapplyHighlights(); // Reapply highlights after font size change
    }
  };

  // Change Theme and Apply the respective styles
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    if (renditionRef.current) {
      const themes = renditionRef.current.themes;
      switch (newTheme) {
        case 'dark':
          themes.override('color', '#d3d3d3'); // Softer white
          themes.override('background', '#1a1a1a'); // Softer black
          break;
        case 'light':
          themes.override('color', '#1a1a1a');
          themes.override('background', '#d3d3d3');
          break;
        case 'sepia':
          themes.override('color', '#5b4636');
          themes.override('background', '#f4ecd8');
          break;
        default:
          break;
      }
    }
  };

  // Handle location change for pagination
  const locationChanged = (epubcifi) => {
    setLocation(epubcifi);
  };

  // Handle file upload using FileReader
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileData(event.target.result); 
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Add a highlight with the selected color
  const handleHighlight = (cfiRange, color) => {
    if (renditionRef.current) {
      const text = renditionRef.current.getRange(cfiRange).toString();
      setSelections((list) => [
        ...list,
        { text, cfiRange, color },
      ]);
      applyHighlight(cfiRange, color);
      setShowNoteIcon(true); // Show the note icon when the highlight is added
    }
  };

  // Tailwind color mappings
  const tailwindColorMap = {
    red: '#f87171',   // Tailwind red-400
    yellow: '#facc15', // Tailwind yellow-400
    green: '#4ade80', // Tailwind green-400
    blue: '#60a5fa',   // Tailwind blue-400
    purple: '#c084fc'  // Tailwind purple-400
  };

  // Function to apply a highlight to the text
  const applyHighlight = (cfiRange, color) => {
    if (renditionRef.current) {
      const annotations = renditionRef.current.annotations;
      const highlightId = `${cfiRange}-${color}`;
      const tailwindColor = tailwindColorMap[color]; // Get corresponding Tailwind color

      annotations.add(
        'highlight',
        cfiRange,
        {},
        () => console.log('click on selection', cfiRange),
        highlightId,
        { fill: tailwindColor, 'fill-opacity': '0.5', 'mix-blend-mode': 'multiply' }
      );
      highlightRefs.current.set(highlightId, cfiRange); // Store the highlight reference
    }
  };

  // Clear all highlights
  const clearHighlights = () => {
    if (renditionRef.current) {
      const annotations = renditionRef.current.annotations;
      highlightRefs.current.forEach((cfiRange, highlightId) => {
        annotations.remove(cfiRange, 'highlight');
      });
      highlightRefs.current.clear(); // Clear the map
    }
  };

  // Reapply all highlights after a font size change
  const reapplyHighlights = () => {
    clearHighlights();
    selections.forEach(({ cfiRange, color }) => {
      applyHighlight(cfiRange, color); // Reapply highlight for each selection
    });
  };

  // Handle color selection
  const handleColorSelect = (color) => {
    setHighlightColor(color);
    if (selectionCfi) {
      handleHighlight(selectionCfi, color); // Apply the selected color
      setShowColorPicker(false); // Close color picker
      setShowNoteIcon(true); // Show note icon after color is selected
    }
  };

  // Show note modal
  const addNote = () => {
    if (selectionCfi) {
      setNoteModalVisible(true); // Open the modal
    }
  };

  // Save the note and close the modal
  const handleSaveNote = () => {
    if (currentNote && selectionCfi) {
      setNotes((prevNotes) => new Map(prevNotes).set(selectionCfi, currentNote));
      setNoteModalVisible(false); // Close the modal
      setShowNoteIcon(false); // Hide the note icon after adding the note
      setCurrentNote(''); // Clear the current note text
    }
  };

  // Handle color picker visibility
  const handleCloseColorPicker = () => {
    setShowColorPicker(false);
    setSelectionCfi(null); // Clear the selected text CFI
    setShowNoteIcon(false); // Hide the note icon
  };

  // Set up the selection and display color picker and note icon
  useEffect(() => {
    if (renditionRef.current) {
      const setRenderSelection = (cfiRange, contents) => {
        setSelectionCfi(cfiRange);
        setShowColorPicker(true); 
        contents.window.getSelection()?.removeAllRanges(); 
      };
      renditionRef.current.on('selected', setRenderSelection);
      return () => {
        renditionRef.current?.off('selected', setRenderSelection);
      };
    }
  }, [renditionRef.current]);

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
