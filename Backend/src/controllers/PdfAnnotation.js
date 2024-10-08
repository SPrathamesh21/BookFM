const Annotation = require('../models/PdfAnnotation');

// Save annotations (both highlights and notes)
const saveAnnotations = async (req, res) => {
  const { userId, bookId, highlights, postAnnotations } = req.body;
  const flattenedHighlights = Object.values(highlights).flat();

  try {
    const existingAnnotation = await Annotation.findOne({ userId, bookId });

    if (existingAnnotation) {
      // Check if highlights or notes exist to avoid saving empty data
      if (flattenedHighlights.length || postAnnotations.length) {
        const currentAnnotation = existingAnnotation.annotations.find(annotation => 
          annotation.bookId === bookId && annotation.userId === userId
        );

        if (currentAnnotation) {
          // Update existing highlights and notes
          currentAnnotation.highlights = flattenedHighlights;
          currentAnnotation.notes = postAnnotations;
        } else {
          // Only add a new annotation if there's data to add
          existingAnnotation.annotations.push({
            highlights: flattenedHighlights,
            notes: postAnnotations,
          });
        }

        await existingAnnotation.save();
        res.status(200).json(existingAnnotation);
      } else {
        res.status(400).json({ message: 'No valid highlights or annotations to save' });
      }
    } else {
      // Only create a new annotation if there is data
      if (flattenedHighlights.length || postAnnotations.length) {
        const newAnnotation = new Annotation({
          userId,
          bookId,
          annotations: [{ highlights: flattenedHighlights, notes: postAnnotations }],
        });
        await newAnnotation.save();
        res.status(201).json(newAnnotation);
      } else {
        res.status(400).json({ message: 'No valid highlights or annotations to save' });
      }
    }
  } catch (error) {
    console.error('Error saving annotations:', error);
    res.status(500).json({ message: 'Error saving annotations', error });
  }
};


  
// Get annotations by userId and bookId
const getAnnotations = async (req, res) => {
    const { userId, bookId } = req.params;
    try {
      // Find the document by userId and bookId
      const annotationDoc = await Annotation.findOne({ userId, bookId });
  
      // Check if document exists
      if (annotationDoc) {
        // Log the fetched data for debugging
        // console.log('Fetched annotations:', annotationDoc);
  
        // Respond with the fetched data
        res.status(200).json(annotationDoc);
      } else {
        // Respond with a 404 if no annotations found
        res.status(404).json({ message: 'No annotations found' });
      }
    } catch (error) {
      // Log error for debugging
      console.error('Error fetching annotations:', error);
  
      // Respond with a 500 error and detailed message
      res.status(500).json({ message: 'Error fetching annotations', error: error.message });
    }
  };
  

module.exports = {
  saveAnnotations,
  getAnnotations
};
