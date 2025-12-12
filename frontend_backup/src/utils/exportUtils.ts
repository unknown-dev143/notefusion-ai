import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { marked } from 'marked';

export const exportToPdf = async (content: string, title: string = 'document') => {
  const { jsPDF } = await import('jspdf');
  const { default: html2canvas } = await import('html2canvas');
  
  // Create a temporary div to render the HTML
  const element = document.createElement('div');
  element.innerHTML = marked(content);
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  document.body.appendChild(element);
  
  // Convert to canvas then to PDF
  const canvas = await html2canvas(element);
  document.body.removeChild(element);
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF();
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`${title}.pdf`);
};

export const exportToDocx = async (content: string, title: string = 'document') => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: title,
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: content,
            }),
          ],
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  saveAs(blob, `${title}.docx`);
};

export const exportToMarkdown = (content: string, title: string = 'document') => {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, `${title}.md`);
};

export const exportToTxt = (content: string, title: string = 'document') => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${title}.txt`);
};

export const importFromFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      if (!event.target?.result) {
        reject(new Error('Failed to read file'));
        return;
      }
      
      // Handle different file types
      if (file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        const content = event.target.result as string;
        resolve(content);
      } else if (file.name.endsWith('.docx')) {
        try {
          // Try lazy-loading mammoth for DOCX parsing
          const mammoth = await import('mammoth');
          const arrayBuffer = event.target.result as ArrayBuffer;
          // Prefer raw text for now to keep formatting simple
          const { value } = await mammoth.extractRawText({ arrayBuffer });
          resolve(value || '');
        } catch (err) {
          reject(new Error('DOCX import requires the "mammoth" package. Please install it to enable .docx import.'));
        }
      } else {
        reject(new Error('Unsupported file type'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    if (file.name.endsWith('.docx')) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  });
};
