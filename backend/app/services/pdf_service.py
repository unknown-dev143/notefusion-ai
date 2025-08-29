<<<<<<< HEAD
import asyncio
import os
from typing import Dict, List, Optional, Any
import json

# Try to import PyMuPDF, but provide fallback if not available
try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False
    print("Warning: PyMuPDF not available. PDF processing will use fallback methods.")

class PDFService:
    def __init__(self):
        self.supported_extensions = ['.pdf']
    
    async def extract_text(self, file_path: str) -> str:
        """Extract text from PDF file"""
        if not PYMUPDF_AVAILABLE:
            return f"[PDF text extraction placeholder for {file_path}] - PyMuPDF not available. Please install PyMuPDF package."
        
        try:
            # Run in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            text = await loop.run_in_executor(None, self._extract_text_sync, file_path)
            return text
        except Exception as e:
            print(f"Error extracting text from {file_path}: {e}")
            return f"[PDF extraction error: {str(e)}]"
    
    def _extract_text_sync(self, file_path: str) -> str:
        """Synchronous text extraction"""
        try:
            doc = fitz.open(file_path)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text
        except Exception as e:
            raise Exception(f"PDF text extraction failed: {str(e)}")
    
    async def extract_text_with_structure(self, file_path: str) -> Dict[str, Any]:
        """Extract text with structural information (headings, lists, etc.)"""
        if not PYMUPDF_AVAILABLE:
            return {
                "text": f"[PDF structured extraction placeholder for {file_path}]",
                "structure": {"headings": [], "lists": [], "paragraphs": []},
                "metadata": {"pages": 0, "title": "Unknown"}
            }
        
        try:
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, self._extract_text_with_structure_sync, file_path)
            return result
        except Exception as e:
            print(f"Error extracting structured text from {file_path}: {e}")
            return {
                "text": f"[PDF structured extraction error: {str(e)}]",
                "structure": {"headings": [], "lists": [], "paragraphs": []},
                "metadata": {"pages": 0, "title": "Unknown"}
            }
    
    def _extract_text_with_structure_sync(self, file_path: str) -> Dict[str, Any]:
        """Synchronous structured text extraction"""
        try:
            doc = fitz.open(file_path)
            full_text = ""
            structure = {
                "headings": [],
                "lists": [],
                "paragraphs": []
            }
            
            for page_num, page in enumerate(doc):
                page_text = page.get_text()
                full_text += page_text
                
                # Basic structure analysis
                lines = page_text.split('\n')
                for line in lines:
                    line = line.strip()
                    if line:
                        if self._is_heading(line):
                            structure["headings"].append({
                                "text": line,
                                "level": self._get_heading_level(line),
                                "page": page_num + 1
                            })
                        elif self._is_list_item(line):
                            structure["lists"].append({
                                "text": line,
                                "type": self._get_list_type(line),
                                "page": page_num + 1
                            })
                        else:
                            structure["paragraphs"].append({
                                "text": line,
                                "page": page_num + 1
                            })
            
            metadata = {
                "pages": len(doc),
                "title": doc.metadata.get("title", "Unknown"),
                "author": doc.metadata.get("author", "Unknown"),
                "subject": doc.metadata.get("subject", "")
            }
            
            doc.close()
            
            return {
                "text": full_text,
                "structure": structure,
                "metadata": metadata
            }
            
        except Exception as e:
            raise Exception(f"PDF structured extraction failed: {str(e)}")
    
    def _is_heading(self, text: str) -> bool:
        """Check if text looks like a heading"""
        # Simple heuristics for heading detection
        if len(text) < 100 and text.isupper():
            return True
        if text.startswith(('Chapter', 'Section', 'Part', 'Unit')):
            return True
        if text.endswith(':') and len(text) < 50:
            return True
        return False
    
    def _get_heading_level(self, text: str) -> int:
        """Determine heading level"""
        if text.startswith(('Chapter', 'Part')):
            return 1
        elif text.startswith(('Section', 'Unit')):
            return 2
        elif text.isupper() and len(text) < 30:
            return 3
        else:
            return 4
    
    def _is_list_item(self, text: str) -> bool:
        """Check if text looks like a list item"""
        return text.startswith(('•', '-', '*', '1.', '2.', '3.', 'a.', 'b.', 'c.'))
    
    def _get_list_type(self, text: str) -> str:
        """Determine list type"""
        if text.startswith(('1.', '2.', '3.')):
            return "ordered"
        else:
            return "unordered"
    
    async def extract_images(self, file_path: str) -> List[Dict[str, Any]]:
        """Extract images from PDF"""
        if not PYMUPDF_AVAILABLE:
            return [{"error": "PyMuPDF not available for image extraction"}]
        
        try:
            loop = asyncio.get_event_loop()
            images = await loop.run_in_executor(None, self._extract_images_sync, file_path)
            return images
        except Exception as e:
            print(f"Error extracting images from {file_path}: {e}")
            return [{"error": f"Image extraction error: {str(e)}"}]
    
    def _extract_images_sync(self, file_path: str) -> List[Dict[str, Any]]:
        """Synchronous image extraction"""
        try:
            doc = fitz.open(file_path)
            images = []
            
            for page_num, page in enumerate(doc):
                image_list = page.get_images()
                
                for img_index, img in enumerate(image_list):
                    xref = img[0]
                    pix = fitz.Pixmap(doc, xref)
                    
                    if pix.n - pix.alpha < 4:  # GRAY or RGB
                        img_data = pix.tobytes("png")
                        images.append({
                            "page": page_num + 1,
                            "index": img_index,
                            "width": pix.width,
                            "height": pix.height,
                            "data": img_data,
                            "format": "png"
                        })
                    
                    pix = None
            
            doc.close()
            return images
            
        except Exception as e:
            raise Exception(f"PDF image extraction failed: {str(e)}")
    
    async def get_pdf_info(self, file_path: str) -> Dict[str, Any]:
        """Get PDF metadata and information"""
        if not PYMUPDF_AVAILABLE:
            return {
                "error": "PyMuPDF not available",
                "filename": os.path.basename(file_path)
            }
        
        try:
            loop = asyncio.get_event_loop()
            info = await loop.run_in_executor(None, self._get_pdf_info_sync, file_path)
            return info
        except Exception as e:
            print(f"Error getting PDF info for {file_path}: {e}")
            return {
                "error": f"PDF info error: {str(e)}",
                "filename": os.path.basename(file_path)
            }
    
    def _get_pdf_info_sync(self, file_path: str) -> Dict[str, Any]:
        """Synchronous PDF info extraction"""
        try:
            doc = fitz.open(file_path)
            
            info = {
                "filename": os.path.basename(file_path),
                "pages": len(doc),
                "metadata": doc.metadata,
                "file_size": os.path.getsize(file_path),
                "format": "PDF"
            }
            
            doc.close()
            return info
            
        except Exception as e:
=======
import asyncio
import os
from typing import Dict, List, Optional, Any
import json

# Try to import PyMuPDF, but provide fallback if not available
try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False
    print("Warning: PyMuPDF not available. PDF processing will use fallback methods.")

class PDFService:
    def __init__(self):
        self.supported_extensions = ['.pdf']
    
    async def extract_text(self, file_path: str) -> str:
        """Extract text from PDF file"""
        if not PYMUPDF_AVAILABLE:
            return f"[PDF text extraction placeholder for {file_path}] - PyMuPDF not available. Please install PyMuPDF package."
        
        try:
            # Run in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            text = await loop.run_in_executor(None, self._extract_text_sync, file_path)
            return text
        except Exception as e:
            print(f"Error extracting text from {file_path}: {e}")
            return f"[PDF extraction error: {str(e)}]"
    
    def _extract_text_sync(self, file_path: str) -> str:
        """Synchronous text extraction"""
        try:
            doc = fitz.open(file_path)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text
        except Exception as e:
            raise Exception(f"PDF text extraction failed: {str(e)}")
    
    async def extract_text_with_structure(self, file_path: str) -> Dict[str, Any]:
        """Extract text with structural information (headings, lists, etc.)"""
        if not PYMUPDF_AVAILABLE:
            return {
                "text": f"[PDF structured extraction placeholder for {file_path}]",
                "structure": {"headings": [], "lists": [], "paragraphs": []},
                "metadata": {"pages": 0, "title": "Unknown"}
            }
        
        try:
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, self._extract_text_with_structure_sync, file_path)
            return result
        except Exception as e:
            print(f"Error extracting structured text from {file_path}: {e}")
            return {
                "text": f"[PDF structured extraction error: {str(e)}]",
                "structure": {"headings": [], "lists": [], "paragraphs": []},
                "metadata": {"pages": 0, "title": "Unknown"}
            }
    
    def _extract_text_with_structure_sync(self, file_path: str) -> Dict[str, Any]:
        """Synchronous structured text extraction"""
        try:
            doc = fitz.open(file_path)
            full_text = ""
            structure = {
                "headings": [],
                "lists": [],
                "paragraphs": []
            }
            
            for page_num, page in enumerate(doc):
                page_text = page.get_text()
                full_text += page_text
                
                # Basic structure analysis
                lines = page_text.split('\n')
                for line in lines:
                    line = line.strip()
                    if line:
                        if self._is_heading(line):
                            structure["headings"].append({
                                "text": line,
                                "level": self._get_heading_level(line),
                                "page": page_num + 1
                            })
                        elif self._is_list_item(line):
                            structure["lists"].append({
                                "text": line,
                                "type": self._get_list_type(line),
                                "page": page_num + 1
                            })
                        else:
                            structure["paragraphs"].append({
                                "text": line,
                                "page": page_num + 1
                            })
            
            metadata = {
                "pages": len(doc),
                "title": doc.metadata.get("title", "Unknown"),
                "author": doc.metadata.get("author", "Unknown"),
                "subject": doc.metadata.get("subject", "")
            }
            
            doc.close()
            
            return {
                "text": full_text,
                "structure": structure,
                "metadata": metadata
            }
            
        except Exception as e:
            raise Exception(f"PDF structured extraction failed: {str(e)}")
    
    def _is_heading(self, text: str) -> bool:
        """Check if text looks like a heading"""
        # Simple heuristics for heading detection
        if len(text) < 100 and text.isupper():
            return True
        if text.startswith(('Chapter', 'Section', 'Part', 'Unit')):
            return True
        if text.endswith(':') and len(text) < 50:
            return True
        return False
    
    def _get_heading_level(self, text: str) -> int:
        """Determine heading level"""
        if text.startswith(('Chapter', 'Part')):
            return 1
        elif text.startswith(('Section', 'Unit')):
            return 2
        elif text.isupper() and len(text) < 30:
            return 3
        else:
            return 4
    
    def _is_list_item(self, text: str) -> bool:
        """Check if text looks like a list item"""
        return text.startswith(('•', '-', '*', '1.', '2.', '3.', 'a.', 'b.', 'c.'))
    
    def _get_list_type(self, text: str) -> str:
        """Determine list type"""
        if text.startswith(('1.', '2.', '3.')):
            return "ordered"
        else:
            return "unordered"
    
    async def extract_images(self, file_path: str) -> List[Dict[str, Any]]:
        """Extract images from PDF"""
        if not PYMUPDF_AVAILABLE:
            return [{"error": "PyMuPDF not available for image extraction"}]
        
        try:
            loop = asyncio.get_event_loop()
            images = await loop.run_in_executor(None, self._extract_images_sync, file_path)
            return images
        except Exception as e:
            print(f"Error extracting images from {file_path}: {e}")
            return [{"error": f"Image extraction error: {str(e)}"}]
    
    def _extract_images_sync(self, file_path: str) -> List[Dict[str, Any]]:
        """Synchronous image extraction"""
        try:
            doc = fitz.open(file_path)
            images = []
            
            for page_num, page in enumerate(doc):
                image_list = page.get_images()
                
                for img_index, img in enumerate(image_list):
                    xref = img[0]
                    pix = fitz.Pixmap(doc, xref)
                    
                    if pix.n - pix.alpha < 4:  # GRAY or RGB
                        img_data = pix.tobytes("png")
                        images.append({
                            "page": page_num + 1,
                            "index": img_index,
                            "width": pix.width,
                            "height": pix.height,
                            "data": img_data,
                            "format": "png"
                        })
                    
                    pix = None
            
            doc.close()
            return images
            
        except Exception as e:
            raise Exception(f"PDF image extraction failed: {str(e)}")
    
    async def get_pdf_info(self, file_path: str) -> Dict[str, Any]:
        """Get PDF metadata and information"""
        if not PYMUPDF_AVAILABLE:
            return {
                "error": "PyMuPDF not available",
                "filename": os.path.basename(file_path)
            }
        
        try:
            loop = asyncio.get_event_loop()
            info = await loop.run_in_executor(None, self._get_pdf_info_sync, file_path)
            return info
        except Exception as e:
            print(f"Error getting PDF info for {file_path}: {e}")
            return {
                "error": f"PDF info error: {str(e)}",
                "filename": os.path.basename(file_path)
            }
    
    def _get_pdf_info_sync(self, file_path: str) -> Dict[str, Any]:
        """Synchronous PDF info extraction"""
        try:
            doc = fitz.open(file_path)
            
            info = {
                "filename": os.path.basename(file_path),
                "pages": len(doc),
                "metadata": doc.metadata,
                "file_size": os.path.getsize(file_path),
                "format": "PDF"
            }
            
            doc.close()
            return info
            
        except Exception as e:
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
            raise Exception(f"PDF info extraction failed: {str(e)}") 