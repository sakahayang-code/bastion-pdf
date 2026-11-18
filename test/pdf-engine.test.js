const assert = require('assert');
const { PDFDocument, rgb, StandardFonts, degrees } = require('pdf-lib');

console.log('🧪 Testing PDF Engine Capabilities (F01, F02, F04)...');

async function runPdfTests() {
  // Setup: Create 2 real PDF documents
  const doc1 = await PDFDocument.create();
  const font = await doc1.embedFont(StandardFonts.Helvetica);
  const page1 = doc1.addPage([400, 300]);
  page1.drawText('Document 1 Page 1', { x: 50, y: 250, size: 20, font, color: rgb(0, 0, 0) });
  const bytes1 = await doc1.save();

  const doc2 = await PDFDocument.create();
  const page2 = doc2.addPage([400, 300]);
  page2.drawText('Document 2 Page 1', { x: 50, y: 250, size: 20, font, color: rgb(0, 0, 0) });
  const bytes2 = await doc2.save();

  // Test 1: F01-H1 Merge multiple PDF documents
  console.log('  1. Testing F01-H1: Merging 2 PDFs into single document...');
  const mergedPdf = await PDFDocument.create();
  const loaded1 = await PDFDocument.load(bytes1);
  const loaded2 = await PDFDocument.load(bytes2);

  const copied1 = await mergedPdf.copyPages(loaded1, loaded1.getPageIndices());
  copied1.forEach(p => mergedPdf.addPage(p));
  const copied2 = await mergedPdf.copyPages(loaded2, loaded2.getPageIndices());
  copied2.forEach(p => mergedPdf.addPage(p));

  const mergedBytes = await mergedPdf.save({ useObjectStreams: true });
  const verificationDoc = await PDFDocument.load(mergedBytes);
  assert.strictEqual(verificationDoc.getPageCount(), 2, 'Merged document must have 2 pages');
  console.log('     ✓ Successfully merged 2 documents into 2-page PDF.');

  // Test 2: F01-E2 Page Rotation
  console.log('  2. Testing F01-E2: Applying 90-degree rotation...');
  const rotateDoc = await PDFDocument.load(bytes1);
  const p = rotateDoc.getPage(0);
  p.setRotation(degrees(90));
  const rotatedBytes = await rotateDoc.save();
  const verifyRot = await PDFDocument.load(rotatedBytes);
  assert.strictEqual(verifyRot.getPage(0).getRotation().angle, 90, 'Page rotation angle must be 90');
  console.log('     ✓ Page rotation verified (90°).');

  // Test 3: F04-H1 Watermark text stamping
  console.log('  3. Testing F04-H1: Applying 45-degree watermark text...');
  const wmDoc = await PDFDocument.load(bytes1);
  const wmPage = wmDoc.getPage(0);
  const { width, height } = wmPage.getSize();
  wmPage.drawText('CONFIDENTIAL', {
    x: width / 4,
    y: height / 2,
    size: 32,
    rotate: degrees(45),
    opacity: 0.35,
    color: rgb(0.74, 0.07, 0.23)
  });
  const wmBytes = await wmDoc.save();
  const verifyWm = await PDFDocument.load(wmBytes);
  assert(verifyWm.getPageCount() === 1, 'Watermarked PDF should retain valid page count');
  console.log('     ✓ Watermark successfully stamped on PDF.');

  // Test 4: F01-N1 Negative test: corrupted input
  console.log('  4. Testing F01-N1: Handling corrupt or non-PDF binary data...');
  const corruptData = Buffer.from('NOT_A_REAL_PDF_HEADER_12345');
  let caughtError = false;
  try {
    await PDFDocument.load(corruptData);
  } catch (err) {
    caughtError = true;
  }
  assert.strictEqual(caughtError, true, 'Corrupt data must throw error gracefully');
  console.log('     ✓ Corrupted input rejected safely with handled exception.');

  console.log('🎉 ALL PDF ENGINE TESTS PASSED (4/4)!\n');
}

runPdfTests().catch(err => {
  console.error('Test failure:', err);
  process.exit(1);
});
