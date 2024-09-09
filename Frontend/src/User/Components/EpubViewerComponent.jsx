import React, { useState, useEffect, useRef } from 'react';
import { Drawer, Button, Typography, Box, AppBar, Toolbar, IconButton, Slider, TextField } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TableChartIcon from '@mui/icons-material/TableChart'; 
import ePub from 'epubjs';

const EBookReader = () => {
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
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: settings.backgroundColor }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setSettingsDrawerOpen(true)}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        E-Book Reader
                    </Typography>
                    <IconButton color="inherit" onClick={() => setTocDrawerOpen(true)}>
                        <TableChartIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Box sx={{ p: 2 }}>
                <input type="file" accept=".epub" onChange={handleFileUpload} />
            </Box>

            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <TextField
                    label="Search"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: '300px' }}
                />
                <Button variant="contained" onClick={handleSearch} sx={{ ml: 2 }}>
                    Search
                </Button>
            </Box>

            <Box sx={{ p: 2, display: searchResults.length > 0 ? 'flex' : 'none', justifyContent: 'center', alignItems: 'center' }}>
                <Button variant="contained" onClick={handlePrevResult} sx={{ mr: 2 }}>
                    Previous
                </Button>
                <Typography>{`${currentResultIndex + 1} of ${searchResults.length}`}</Typography>
                <Button variant="contained" onClick={handleNextResult} sx={{ ml: 2 }}>
                    Next
                </Button>
            </Box>

            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box sx={{ width: '80%', height: '100%', overflow: 'hidden' }} ref={containerRef} />
            </Box>

            {rendition && (
                <>
                    <Box sx={{ p: 2, position: 'fixed', bottom: 60, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
                        <IconButton onClick={handlePrev}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography>{`Page ${currentPage} of ${totalPages}`}</Typography>
                        <IconButton onClick={handleNext}>
                            <ArrowForwardIcon />
                        </IconButton>
                    </Box>

                    <Box sx={{ position: 'fixed', bottom: 0, width: '100%', p: 2, backgroundColor: '#f0f0f0' }}>
                        <Slider
                            value={progress}
                            onChange={(e, value) => {
                                const targetPage = (value / 100) * totalPages;
                                const cfi = rendition.book.locations.cfiFromPercentage(targetPage / totalPages);
                                rendition.display(cfi);
                                setProgress(value);
                            }}
                        />
                    </Box>
                </>
            )}

            <Drawer anchor="left" open={settingsDrawerOpen} onClose={() => setSettingsDrawerOpen(false)}>
                <Box sx={{ width: 250, p: 2 }}>
                    <Typography variant="h6">Settings</Typography>
                    <Typography variant="subtitle1">Font Size</Typography>
                    <Slider
                        value={parseInt(settings.fontSize, 10)}
                        onChange={(e, value) => handleSettingsChange('fontSize', `${value}px`)}
                        min={12}
                        max={36}
                    />
                    <Typography variant="subtitle1">Columns</Typography>
                    <Slider
                        value={settings.columnCount}
                        onChange={(e, value) => handleSettingsChange('columnCount', value)}
                        min={1}
                        max={3}
                    />
                    <Button onClick={() => handleModeChange('white')}>Light Mode</Button>
                    <Button onClick={() => handleModeChange('sepia')}>Sepia Mode</Button>
                    <Button onClick={() => handleModeChange('night')}>Night Mode</Button>
                </Box>
            </Drawer>

            <Drawer anchor="right" open={tocDrawerOpen} onClose={() => setTocDrawerOpen(false)}>
                <Box sx={{ width: 250, p: 2 }}>
                    <Typography variant="h6">Table of Contents</Typography>
                    <ul>
                        {toc.map((chapter) => (
                            <li key={chapter.id}>
                                <Button onClick={() => handleToCClick(chapter.href)}>
                                    {chapter.label}
                                </Button>
                            </li>
                        ))}
                    </ul>
                </Box>
            </Drawer>
        </Box>
    );
};

export default EBookReader;
