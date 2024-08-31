// const epub = require('epub-gen');

// exports.convertToEpub = async (pdfBuffer, bookName, author) => {
//   const options = {
//     bookName: bookName || 'Untitled',
//     author: author || 'Unknown Author',
//     content: [{ bookName: 'Chapter 1', data: pdfBuffer.toString('base64') }],
//   };

//   try {
//     // Use the EPUB generation library
//     const epubBuffer = await epub.generate(options);
//     return epubBuffer.toString('base64');
//   } catch (error) {
//     console.error('Error converting to EPUB:', error);
//     throw new Error('Failed to convert PDF to EPUB');
//   }
// };
