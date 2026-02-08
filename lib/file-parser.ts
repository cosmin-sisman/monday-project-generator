import { parse } from 'csv-parse/sync';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
if (typeof window === 'undefined') {
  // Server-side
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export async function parseCSV(file: File): Promise<string> {
  const text = await file.text();
  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
  });
  
  // Convert to readable text
  let output = 'CSV Data:\n\n';
  records.forEach((record: any, index: number) => {
    output += `Row ${index + 1}:\n`;
    Object.entries(record).forEach(([key, value]) => {
      output += `  ${key}: ${value}\n`;
    });
    output += '\n';
  });
  
  return output;
}

export async function parsePDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let text = 'PDF Content:\n\n';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ');
    text += `Page ${i}:\n${pageText}\n\n`;
  }
  
  return text;
}

export async function parseDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return `DOCX Content:\n\n${result.value}`;
}

export async function parseFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'csv':
      return await parseCSV(file);
    case 'pdf':
      return await parsePDF(file);
    case 'docx':
    case 'doc':
      return await parseDOCX(file);
    case 'txt':
      return await file.text();
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}
