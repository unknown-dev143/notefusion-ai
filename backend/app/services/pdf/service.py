from typing import Optional, List
import fitz  # PyMuPDF
from pathlib import Path

class PDFService:
    def __init__(self):
        self._has_pymupdf = True
        try:
            import fitz
        except ImportError:
            self._has_pymupdf = False

    async def extract_text(self, pdf_path: str, pages: Optional[List[int]] = None) -> dict:
        """Extract text from PDF with optional page selection"""
        if not self._has_pymupdf:
            return {"error": "PyMuPDF not available", "fallback": True, "text": ""}

        try:
            doc = fitz.open(pdf_path)
            text = ""
            
            if pages:
                for page_num in pages:
                    if 0 <= page_num < len(doc):
                        text += doc[page_num].get_text()
            else:
                for page in doc:
                    text += page.get_text()
            
            doc.close()
            return {"text": text, "fallback": False}
        except Exception as e:
            return {"error": str(e), "fallback": True, "text": ""}

    async def export_to_pdf(self, markdown_content: str, diagrams: List[dict] = None) -> bytes:
        """Convert markdown content to PDF with optional diagrams"""
        if not self._has_pymupdf:
            return None

        try:
            # TODO: Implement markdown to PDF conversion with WeasyPrint or alternative
            doc = fitz.open()
            page = doc.new_page()
            page.insert_text((50, 50), markdown_content)
            
            if diagrams:
                for diagram in diagrams:
                    # TODO: Insert diagrams into PDF
                    pass

            pdf_bytes = doc.write()
            doc.close()
            return pdf_bytes
        except Exception as e:
            return None
