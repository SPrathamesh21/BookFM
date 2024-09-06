import React, { useState, useEffect, useRef } from 'react';
import { Drawer, Button, Typography, Box, AppBar, Toolbar, IconButton, Slider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TableChartIcon from '@mui/icons-material/TableChart'; // Import Table of Contents icon
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

    // Handle EPUB file upload
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

    // EPUB book rendition setup
    useEffect(() => {
        if (book && containerRef.current) {
            const rendition = book.renderTo(containerRef.current, {
                width: '100%',
                height: '100%',
                flow: 'paginated',
            });

            rendition.display().then(() => {
                setRendition(rendition);

                rendition.book.locations.generate().then(() => {
                    const total = rendition.book.locations.total;
                    setTotalPages(total);
                    const location = rendition.currentLocation();
                    setCurrentPage(rendition.book.locations.percentageFromCfi(location.start.cfi) * total);
                });
            });

            rendition.on('relocated', (location) => {
                const total = rendition.book.locations.total;
                const currentPage = rendition.book.locations.percentageFromCfi(location.start.cfi) * total;
                setCurrentPage(Math.ceil(currentPage));
                setProgress((currentPage / total) * 100);
            });

            // Fetch the table of contents
            book.loaded.navigation.then(nav => {
                setToc(nav.toc);
            });

            // Ensure new chapters start on a new page
            rendition.on('rendered', () => {
                const chapters = book.spine.get();
                chapters.forEach((chapter) => {
                    chapter.element.style.pageBreakBefore = 'always';
                });
            });
        }
    }, [book]);

    // Apply settings like background color, font, etc.
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

    // Handle settings changes
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
                </Toolbar>
            </AppBar>

            <Box sx={{ p: 2 }}>
                <input type="file" accept=".epub" onChange={handleFileUpload} />
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
                            onChange={(e, newValue) => rendition.display(Math.floor(newValue * totalPages / 100))}
                            aria-labelledby="progress-bar"
                        />
                    </Box>
                </>
            )}

            {/* Settings Drawer */}
            <Drawer anchor="right" open={settingsDrawerOpen} onClose={() => setSettingsDrawerOpen(false)}>
                <Box sx={{ width: 250, p: 2 }}>
                    <Typography variant="h6">Settings</Typography>

                    <Typography>Mode</Typography>
                    <Button onClick={() => handleModeChange('white')}>White</Button>
                    <Button onClick={() => handleModeChange('sepia')}>Sepia</Button>
                    <Button onClick={() => handleModeChange('night')}>Night Mode</Button>

                    <Typography>Font Family</Typography>
                    <select
                        value={settings.fontFamily}
                        onChange={(e) => handleSettingsChange('fontFamily', e.target.value)}
                    >
                        <option value="serif">Serif</option>
                        <option value="sans-serif">Sans-serif</option>
                        <option value="monospace">Monospace</option>
                    </select>
                    <Typography>Font Size</Typography>
                    <input
                        type="range"
                        min="12"
                        max="24"
                        value={parseInt(settings.fontSize)}
                        onChange={(e) => handleSettingsChange('fontSize', `${e.target.value}px`)}
                    />
                    <Typography>Column Count</Typography>
                    <select
                        value={settings.columnCount}
                        onChange={(e) => handleSettingsChange('columnCount', e.target.value)}
                    >
                        <option value="1">1 Column</option>
                        <option value="2">2 Columns</option>
                        <option value="3">3 Columns</option>
                    </select>
                </Box>
            </Drawer>

            {/* Table of Contents Drawer */}
            <Drawer anchor="right" open={tocDrawerOpen} onClose={() => setTocDrawerOpen(false)}>
                <Box sx={{ width: 250, p: 2 }}>
                    <Typography variant="h6">Table of Contents</Typography>
                    {toc.length > 0 ? (
                        <ul>
                            {toc.map((item, index) => (
                                <li key={index}>
                                    <Button onClick={() => rendition.display(item.href)}>{item.label}</Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <Typography>No Table of Contents Available</Typography>
                    )}
                </Box>
            </Drawer>

            {/* Button to open Table of Contents Drawer */}
            <IconButton
                onClick={() => setTocDrawerOpen(true)}
                sx={{ position: 'fixed', bottom: 20, right: 20, backgroundColor: '#fff' }}
            >
                <TableChartIcon />
            </IconButton>
        </Box>
    );
};

export default EBookReader;
