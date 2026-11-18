import { PDFDocument, degrees } from 'pdf-lib';

/**
 * Clean-room PDF Engine implementing browser/server transformations
 * using standard open-source primitives.
 */

export async function mergePDFs(fileBuffers: ArrayBuffer[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const buffer of fileBuffers) {
    const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save({ useObjectStreams: true });
}

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

export async function addWatermarkText(
  fileBuffer: ArrayBuffer,
  watermarkText: string,
  opacity: number = 0.3
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(fileBuffer);
  const pages = pdf.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText(watermarkText, {
      x: width / 4,
      y: height / 2,
      size: 40,
      opacity,
      rotate: degrees(45),
    });
  }

  return await pdf.save();
}
