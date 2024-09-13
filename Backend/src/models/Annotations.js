const mongoose = require('mongoose');

const annotationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  bookId: { type: String, required: true },
  highlights: [
    {
      cfiRange: String, // CFI range of the highlight
      color: String, // Color of the highlight
      selectedText: String // Text selected for the highlight
    }
  ],
  notes: [
    {
      cfiRange: String, // CFI range of the note
      content: String // Content of the note
    }
  ]
});


const Annotation = mongoose.model('Annotation', annotationSchema);

module.exports = Annotation;
