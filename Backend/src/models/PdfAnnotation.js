const mongoose = require('mongoose');

const PdfAnnotationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  bookId: { type: String, required: true },
  annotations: [
    {
      highlights: [
        {
          rect: {
            top: Number,
            left: Number,
            width: Number,
            height: Number
          },
          color: String,
          text: String // Text selected for the highlight
        }
      ],
      notes: [
        {
          text: String, // Selected text
          note: String, // Note content
          pageNumber: Number // Page number
        }
      ]
    }
  ]
});

const PdfAnnotation = mongoose.model('PdfAnnotation', PdfAnnotationSchema);

module.exports = PdfAnnotation;
