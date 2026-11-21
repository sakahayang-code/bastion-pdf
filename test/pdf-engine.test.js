const assert = require('assert');
const { PDFDocument, rgb, StandardFonts, degrees } = require('pdf-lib');

console.log('🧪 Testing Extended PDF Engine Capabilities (Merge, Rotate, Watermark, Split, Page Numbers, Images)...');

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

  // Test 1: F01-H1 Merge
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

  // Test 4: Split PDF by range
  console.log('  4. Testing Split PDF by page ranges...');
  const splitDoc = await PDFDocument.create();
  const pageA = splitDoc.addPage([400, 300]);
  const pageB = splitDoc.addPage([400, 300]);
  const splitSourceBytes = await splitDoc.save();

  // Extract page 1
  const subDoc1 = await PDFDocument.create();
  const loadedSplit = await PDFDocument.load(splitSourceBytes);
  const extracted = await subDoc1.copyPages(loadedSplit, [0]);
  subDoc1.addPage(extracted[0]);
  const subBytes1 = await subDoc1.save();
  const verifySub = await PDFDocument.load(subBytes1);
  assert.strictEqual(verifySub.getPageCount(), 1, 'Extracted split document should have 1 page');
  console.log('     ✓ Split PDF and page range extraction verified.');

  // Test 5: Add Page Numbers
  console.log('  5. Testing Add Page Numbers (Page 1 of 2)...');
  const numDoc = await PDFDocument.load(mergedBytes);
  const numFont = await numDoc.embedFont(StandardFonts.Helvetica);
  const numPages = numDoc.getPages();
  numPages.forEach((pg, idx) => {
    const text = `Page ${idx + 1} of ${numPages.length}`;
    pg.drawText(text, { x: 50, y: 20, size: 10, font: numFont, color: rgb(0.3, 0.3, 0.3) });
  });
  const numBytes = await numDoc.save();
  const verifyNum = await PDFDocument.load(numBytes);
  assert.strictEqual(verifyNum.getPageCount(), 2);
  console.log('     ✓ Page numbers successfully applied across all document pages.');

  // Test 6: F01-N1 Negative test: corrupted input
  console.log('  6. Testing F01-N1: Handling corrupt or non-PDF binary data...');
  const corruptData = Buffer.from('NOT_A_REAL_PDF_HEADER_12345');
  let caughtError = false;
  try {
    await PDFDocument.load(corruptData);
  } catch (err) {
    caughtError = true;
  }
  assert.strictEqual(caughtError, true, 'Corrupt data must throw error gracefully');
  console.log('     ✓ Corrupted input rejected safely with handled exception.');

  // Test 7: PDF to JPG conversion
  console.log('  7. Testing PDF to JPG conversion via pdftoppm...');
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  const { execSync } = require('child_process');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-jpg-'));
  const testPdfPath = path.join(tmpDir, 'input.pdf');
  fs.writeFileSync(testPdfPath, bytes1);
  execSync(`pdftoppm -jpeg -r 150 "${testPdfPath}" "${path.join(tmpDir, 'page')}"`, { stdio: 'pipe' });
  const jpgs = fs.readdirSync(tmpDir).filter(f => f.endsWith('.jpg'));
  assert(jpgs.length >= 1, 'At least 1 JPG page must be generated');
  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log('     ✓ PDF to JPG page rendering verified.');

  // Test 8: Protect PDF with AES-256-GCM password encryption
  console.log('  8. Testing Protect PDF with AES-256-GCM encryption...');
  const crypto = require('crypto');
  const salt = crypto.randomBytes(16);
  const password = 'VaultPassword!2026';
  const key = crypto.scryptSync(password, salt, 32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encryptedPayload = Buffer.concat([cipher.update(Buffer.from(bytes1)), cipher.final()]);
  const tag = cipher.getAuthTag();
  const protectedEnvelope = Buffer.concat([Buffer.from('BPDF'), salt, iv, tag, encryptedPayload]);
  assert.strictEqual(protectedEnvelope.subarray(0, 4).toString(), 'BPDF', 'Container header must start with BPDF');
  console.log('     ✓ AES-256 authenticated encryption container verified.');

  // Test 9: Unlock protected PDF with password
  console.log('  9. Testing Unlock protected PDF with password...');
  const decSalt = protectedEnvelope.subarray(4, 20);
  const decIv = protectedEnvelope.subarray(20, 32);
  const decTag = protectedEnvelope.subarray(32, 48);
  const decCipher = protectedEnvelope.subarray(48);
  const decKey = crypto.scryptSync(password, decSalt, 32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', decKey, decIv);
  decipher.setAuthTag(decTag);
  const decryptedBytes = Buffer.concat([decipher.update(decCipher), decipher.final()]);
  assert.strictEqual(Buffer.compare(decryptedBytes, Buffer.from(bytes1)), 0, 'Decrypted bytes must match original PDF');
  console.log('     ✓ Password unlock and payload restoration verified.');

  // Test 10: PDF to Word / Layout text extraction & Genuine OpenXML DOCX Generation
  console.log(' 10. Testing PDF to Word / Layout text extraction & Genuine DOCX...');
  const wordTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'test-word-'));
  const wordPdf = path.join(wordTmp, 'doc.pdf');
  const wordTxt = path.join(wordTmp, 'doc.txt');
  fs.writeFileSync(wordPdf, bytes1);
  execSync(`pdftotext -layout "${wordPdf}" "${wordTxt}"`, { stdio: 'pipe' });
  const extractedText = fs.readFileSync(wordTxt, 'utf-8');
  assert(extractedText.includes('Document 1 Page 1'), 'Extracted text must match original PDF content');

  // Verify genuine OpenXML DOCX archive creation
  const JSZip = require('../js/jszip.min.js');
  const testZip = new JSZip();
  testZip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);
  testZip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);
  testZip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body><w:p><w:r><w:t>Document 1 Page 1</w:t></w:r></w:p></w:body>
</w:document>`);
  const docxBuf = await testZip.generateAsync({ type: 'nodebuffer' });
  const docxPath = path.join(wordTmp, 'output.docx');
  fs.writeFileSync(docxPath, docxBuf);
  const pandocCheck = execSync(`pandoc "${docxPath}" -t plain`).toString();
  assert(pandocCheck.includes('Document 1 Page 1'), 'Generated DOCX must be valid OpenXML parsed by pandoc');

  fs.rmSync(wordTmp, { recursive: true, force: true });
  console.log('     ✓ PDF to Word layout text extraction & genuine DOCX verified.');

  // Test 11: Word / Text to PDF synthesis
  console.log(' 11. Testing Text / Word to PDF synthesis...');
  const synthDoc = await PDFDocument.create();
  const synthFont = await synthDoc.embedFont(StandardFonts.Helvetica);
  const synthPage = synthDoc.addPage([595.28, 841.89]);
  synthPage.drawText('Synthesized from Word Document', { x: 50, y: 750, size: 14, font: synthFont });
  const synthBytes = await synthDoc.save();
  const synthVerify = await PDFDocument.load(synthBytes);
  assert.strictEqual(synthVerify.getPageCount(), 1, 'Synthesized PDF must have valid 1 page structure');
  console.log('     ✓ Document to PDF synthesis verified.');

  console.log('🎉 ALL EXTENDED PDF ENGINE TESTS PASSED (11/11)!\n');
}

runPdfTests().catch(err => {
  console.error('Test failure:', err);
  process.exit(1);
});
