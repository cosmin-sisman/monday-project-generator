import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    let extractedText = '';

    switch (extension) {
      case 'csv':
        extractedText = await parseCSV(file);
        break;
      case 'xlsx':
      case 'xls':
        extractedText = await parseXLSX(file);
        break;
      case 'pdf':
        extractedText = await parsePDF(file);
        break;
      case 'docx':
      case 'doc':
        extractedText = await parseDOCX(file);
        break;
      case 'txt':
        extractedText = await file.text();
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported file type: ${extension}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      text: extractedText,
      filename: file.name,
    });
  } catch (error) {
    console.error('Error parsing file:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse file' },
      { status: 500 }
    );
  }
}

async function parseCSV(file: File): Promise<string> {
  const text = await file.text();
  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
  });
  
  let output = '📊 CSV Data:\n\n';
  records.forEach((record: any, index: number) => {
    output += `Row ${index + 1}:\n`;
    Object.entries(record).forEach(([key, value]) => {
      output += `  ${key}: ${value}\n`;
    });
    output += '\n';
  });
  
  return output;
}

async function parseXLSX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
  let output = '📊 Excel Data:\n\n';
  
  workbook.SheetNames.forEach((sheetName) => {
    output += `## Sheet: ${sheetName}\n\n`;
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    data.forEach((row: any, rowIndex: number) => {
      if (row.length > 0) {
        output += `Row ${rowIndex + 1}: ${row.join(' | ')}\n`;
      }
    });
    
    output += '\n';
  });
  
  return output;
}

async function parsePDF(file: File): Promise<string> {
  // For server-side PDF parsing, we'll use a simpler approach
  // In production, consider using pdf-parse instead
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // This is a simplified version - you might want to use pdf-parse library
  return '📄 PDF Content:\n\n(PDF parsing requires additional server-side libraries)\n\nPlease use TXT or DOCX for now, or copy-paste the PDF content.';
}

async function parseDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return `📝 DOCX Content:\n\n${result.value}`;
}
