import { PDFDocument, degrees, StandardFonts, rgb } from 'pdf-lib';

/**
 * Clean-room PDF Engine implementing browser/server transformations
 * using standard open-source primitives.
 */

// 1. Merge
export async function mergePDFs(fileBuffers: ArrayBuffer[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const buffer of fileBuffers) {
    const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save({ useObjectStreams: true });
}

// 2. Rotate
export async function rotatePDFPages(
  fileBuffer: ArrayBuffer,
  rotationAngle: number
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(fileBuffer);
  const pages = pdf.getPages();

  for (const page of pages) {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + rotationAngle) % 360));
  }

  return await pdf.save();
}

// 3. Extract & Split
export async function extractPDFPages(
  fileBuffer: ArrayBuffer,
  pageIndices: number[]
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(fileBuffer);
  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdf, pageIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));
  return await newPdf.save();
}

export async function splitPDF(
  fileBuffer: ArrayBuffer,
  ranges: { start: number; end: number }[]
): Promise<Uint8Array[]> {
  const pdf = await PDFDocument.load(fileBuffer);
  const totalPages = pdf.getPageCount();
  const outputs: Uint8Array[] = [];

  for (const range of ranges) {
    const subDoc = await PDFDocument.create();
    const indices: number[] = [];
    const start = Math.max(0, range.start - 1);
    const end = Math.min(totalPages - 1, range.end - 1);

    for (let i = start; i <= end; i++) {
      indices.push(i);
    }

    if (indices.length > 0) {
      const copied = await subDoc.copyPages(pdf, indices);
      copied.forEach((p) => subDoc.addPage(p));
      outputs.push(await subDoc.save());
    }
  }

  return outputs;
}

// 4. Add Page Numbers
export interface PageNumberOptions {
  format?: string; // e.g., "Page {n} of {total}" or "{n}"
  position?: 'bottom-center' | 'bottom-right' | 'top-right' | 'bottom-left';
  fontSize?: number;
  startNumber?: number;
}

export async function addPageNumbers(
  fileBuffer: ArrayBuffer,
  options: PageNumberOptions = {}
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(fileBuffer);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  const total = pages.length;
  const format = options.format || 'Page {n} of {total}';
  const position = options.position || 'bottom-center';
  const fontSize = options.fontSize || 10;
  const startNum = options.startNumber || 1;

  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    const currentNum = startNum + index;
    const text = format.replace('{n}', currentNum.toString()).replace('{total}', total.toString());
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    let x = width / 2 - textWidth / 2;
    let y = 30; // bottom margin

    if (position === 'bottom-right') {
      x = width - textWidth - 40;
      y = 30;
    } else if (position === 'bottom-left') {
      x = 40;
      y = 30;
    } else if (position === 'top-right') {
      x = width - textWidth - 40;
      y = height - 40;
    }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  });

  return await pdf.save();
}

// 5. Watermark
export async function addWatermarkText(
  fileBuffer: ArrayBuffer,
  watermarkText: string,
  opacity: number = 0.35
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(fileBuffer);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pages = pdf.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText(watermarkText, {
      x: width / 5,
      y: height / 2,
      size: 42,
      font,
      opacity,
      rotate: degrees(45),
      color: rgb(0.74, 0.07, 0.23),
    });
  }

  return await pdf.save();
}

// 6. Image to PDF Converter (JPG / PNG)
export async function convertImagesToPdf(
  images: { buffer: ArrayBuffer; isPng: boolean }[]
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();

  for (const item of images) {
    const embedded = item.isPng
      ? await doc.embedPng(item.buffer)
      : await doc.embedJpg(item.buffer);

    const { width, height } = embedded.scale(1.0);
    // Create page matching image aspect ratio
    const page = doc.addPage([width, height]);
    page.drawImage(embedded, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  return await doc.save();
}

// 7. PDF to JPG Converter (Uses pdftoppm / Cairo)
export async function convertPdfToJpg(
  pdfBuffer: ArrayBuffer | Buffer
): Promise<Buffer[]> {
  const fs = await import('fs');
  const path = await import('path');
  const os = await import('os');
  const { execSync } = await import('child_process');

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bpdf-jpg-'));
  const pdfPath = path.join(tmpDir, 'input.pdf');
  const prefix = path.join(tmpDir, 'page');

  try {
    fs.writeFileSync(pdfPath, Buffer.from(pdfBuffer));
    execSync(`pdftoppm -jpeg -r 150 "${pdfPath}" "${prefix}"`, { stdio: 'pipe' });

    const jpgFiles = fs
      .readdirSync(tmpDir)
      .filter((f) => f.startsWith('page') && f.endsWith('.jpg'))
      .sort();

    const outputBuffers = jpgFiles.map((f) => fs.readFileSync(path.join(tmpDir, f)));
    return outputBuffers;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

// 8. Security: Protect PDF with AES-256-GCM Password Encryption
export async function protectPdfWithPassword(
  pdfBuffer: ArrayBuffer | Buffer,
  password: string
): Promise<Buffer> {
  const crypto = await import('crypto');
  const buffer = Buffer.from(pdfBuffer);
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();

  // MultiPDF Encrypted Container format:
  // MAGIC (4 bytes 'BPDF') + SALT (16) + IV (12) + TAG (16) + ENCRYPTED PAYLOAD
  return Buffer.concat([Buffer.from('BPDF'), salt, iv, tag, encrypted]);
}

// 9. Security: Unlock AES-256 Protected PDF
export async function unlockPdfWithPassword(
  encryptedBuffer: ArrayBuffer | Buffer,
  password: string
): Promise<Buffer> {
  const crypto = await import('crypto');
  const buf = Buffer.from(encryptedBuffer);

  if (buf.subarray(0, 4).toString() !== 'BPDF') {
    throw new Error('Invalid protected PDF container: missing BPDF header signature');
  }

  const salt = buf.subarray(4, 20);
  const iv = buf.subarray(20, 32);
  const tag = buf.subarray(32, 48);
  const ciphertext = buf.subarray(48);

  const key = crypto.scryptSync(password, salt, 32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

// 10. Document Conversion: PDF to Word / Layout Text
export async function convertPdfToWord(
  pdfBuffer: ArrayBuffer | Buffer
): Promise<{ text: string; docxMock: Buffer }> {
  const fs = await import('fs');
  const path = await import('path');
  const os = await import('os');
  const { execSync } = await import('child_process');

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bpdf-word-'));
  const pdfPath = path.join(tmpDir, 'input.pdf');
  const txtPath = path.join(tmpDir, 'output.txt');

  try {
    fs.writeFileSync(pdfPath, Buffer.from(pdfBuffer));
    execSync(`pdftotext -layout "${pdfPath}" "${txtPath}"`, { stdio: 'pipe' });
    const text = fs.readFileSync(txtPath, 'utf-8');
    // Wrap plain layout text into standardized document envelope
    const docxMock = Buffer.from(
      `[MultiPDF Word Export]\n\n${text}`,
      'utf-8'
    );
    return { text, docxMock };
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

// 11. Document Conversion: Word / Text to PDF
export async function convertTextOrWordToPdf(
  textContent: string
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const lines = textContent.split('\n');

  let currentPage = doc.addPage([595.28, 841.89]); // A4
  let y = 800;
  const fontSize = 11;
  const lineHeight = 16;

  for (const line of lines) {
    if (y < 40) {
      currentPage = doc.addPage([595.28, 841.89]);
      y = 800;
    }
    // Draw line
    currentPage.drawText(line.substring(0, 95), {
      x: 40,
      y,
      size: fontSize,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= lineHeight;
  }

  return await doc.save();
}
