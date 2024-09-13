const Annotation = require('../models/Annotations');

exports.saveAnnotations = async (req, res) => {
  const { userId, bookId, cfiRange, content, highlightColor, selectedText } = req.body;
  try {
    // Find the existing annotation document or create a new one
    let annotation = await Annotation.findOne({ userId, bookId });

    if (!annotation) {
      // Create a new annotation if none exists
      annotation = new Annotation({ userId, bookId, highlights: [], notes: [] });
    }

    // Update the highlights array
    const existingHighlight = annotation.highlights.find(item => item.cfiRange === cfiRange);
    if (existingHighlight) {
      existingHighlight.color = highlightColor; // Update the highlight color
      existingHighlight.selectedText = selectedText; // Update the selected text
    } else {
      annotation.highlights.push({ cfiRange, color: highlightColor, selectedText }); // Add new highlight
    }

    // Update the notes array
    const existingNote = annotation.notes.find(item => item.cfiRange === cfiRange);
    if (existingNote) {
      existingNote.content = content; // Update the note content
    } else {
      annotation.notes.push({ cfiRange, content }); // Add new note
    }

    // Save the updated annotation document
    await annotation.save();

    res.status(200).json({ message: 'Annotation saved successfully!', annotation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get highlights and notes for a specific book
exports.getAnnotations = async (req, res) => {
  const { bookId } = req.params;
  try {
    // Retrieve annotations for the specified book
    const annotations = await Annotation.findOne({ bookId });

    if (!annotations) {
        console.log('lskdfjslskdjf')
      return res.status(404).json({ message: 'No annotations found' });
    }

    res.status(200).json(annotations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
