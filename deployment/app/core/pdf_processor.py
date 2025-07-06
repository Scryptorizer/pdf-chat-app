import os
import logging
from typing import Optional, List, Dict
import pdfplumber
from pathlib import Path


logger = logging.getLogger(__name__)


class PDFProcessor:
    """Professional PDF text extraction and processing."""
    
    def __init__(self, pdf_path: str):
        """Initialize with PDF file path."""
        self.pdf_path = Path(pdf_path)
        self._full_text = None
        self._pages = []
        self._metadata = {}
        
    def load_pdf(self) -> bool:
        """Load and extract text from PDF file."""
        try:
            if not self.pdf_path.exists():
                logger.error(f"PDF file not found: {self.pdf_path}")
                return False
                
            logger.info(f"Loading PDF: {self.pdf_path}")
            
            with pdfplumber.open(self.pdf_path) as pdf:
                # Extract metadata
                self._metadata = {
                    "total_pages": len(pdf.pages),
                    "title": getattr(pdf.metadata, 'title', 'Unknown'),
                    "author": getattr(pdf.metadata, 'author', 'Unknown'),
                    "creator": getattr(pdf.metadata, 'creator', 'Unknown')
                }
                
                # Extract text from all pages
                pages_text = []
                for page_num, page in enumerate(pdf.pages, 1):
                    try:
                        page_text = page.extract_text()
                        if page_text and page_text.strip():
                            cleaned_text = self._clean_text(page_text)
                            pages_text.append({
                                "page_number": page_num,
                                "text": cleaned_text,
                                "word_count": len(cleaned_text.split())
                            })
                            logger.debug(f"Extracted {len(cleaned_text)} chars from page {page_num}")
                        else:
                            logger.warning(f"No text found on page {page_num}")
                    except Exception as e:
                        logger.error(f"Error extracting text from page {page_num}: {e}")
                        continue
                
                self._pages = pages_text
                self._full_text = "\n\n".join([page["text"] for page in pages_text])
                
                logger.info(f"Successfully loaded PDF: {len(pages_text)} pages, {len(self._full_text)} total characters")
                return True
                
        except Exception as e:
            logger.error(f"Failed to load PDF {self.pdf_path}: {e}")
            return False
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize extracted text."""
        if not text:
            return ""
            
        # Remove excessive whitespace
        lines = text.split('\n')
        cleaned_lines = []
        
        for line in lines:
            line = line.strip()
            if line:  # Skip empty lines
                # Remove excessive spaces
                line = ' '.join(line.split())
                cleaned_lines.append(line)
        
        return '\n'.join(cleaned_lines)
    
    def get_full_text(self) -> str:
        """Get the complete text content of the PDF."""
        if self._full_text is None:
            logger.warning("PDF not loaded. Call load_pdf() first.")
            return ""
        return self._full_text
    
    def get_pages(self) -> List[Dict]:
        """Get list of pages with their text content."""
        return self._pages.copy()
    
    def get_metadata(self) -> Dict:
        """Get PDF metadata."""
        return self._metadata.copy()
    
    def get_text_chunks(self, chunk_size: int = 2000, overlap: int = 200) -> List[str]:
        """Split text into chunks for better context management."""
        if not self._full_text:
            return []
            
        text = self._full_text
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            
            # Try to break at sentence boundary
            if end < len(text):
                # Look for sentence endings near the chunk boundary
                sentence_ends = ['.', '!', '?', '\n']
                for i in range(min(100, len(text) - end)):
                    if text[end + i] in sentence_ends:
                        end = end + i + 1
                        break
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            start = end - overlap if overlap > 0 else end
            
        logger.info(f"Created {len(chunks)} text chunks")
        return chunks
    
    def search_text(self, query: str, case_sensitive: bool = False) -> List[Dict]:
        """Search for text within the PDF."""
        results = []
        search_query = query if case_sensitive else query.lower()
        
        for page in self._pages:
            page_text = page["text"] if case_sensitive else page["text"].lower()
            
            if search_query in page_text:
                # Find the context around the match
                start_idx = page_text.find(search_query)
                context_start = max(0, start_idx - 100)
                context_end = min(len(page_text), start_idx + len(search_query) + 100)
                context = page["text"][context_start:context_end]
                
                results.append({
                    "page_number": page["page_number"],
                    "context": context,
                    "match_position": start_idx
                })
        
        return results
    
    def get_summary_stats(self) -> Dict:
        """Get summary statistics about the PDF."""
        if not self._pages:
            return {}
            
        total_words = sum(page["word_count"] for page in self._pages)
        total_chars = len(self._full_text) if self._full_text else 0
        
        return {
            "total_pages": len(self._pages),
            "total_words": total_words,
            "total_characters": total_chars,
            "avg_words_per_page": total_words / len(self._pages) if self._pages else 0,
            "metadata": self._metadata
        }


# Global PDF processor instance
_pdf_processor: Optional[PDFProcessor] = None


def get_pdf_processor() -> Optional[PDFProcessor]:
    """Get the global PDF processor instance."""
    return _pdf_processor


def initialize_pdf_processor(pdf_path: str) -> bool:
    """Initialize the global PDF processor."""
    global _pdf_processor
    
    try:
        _pdf_processor = PDFProcessor(pdf_path)
        success = _pdf_processor.load_pdf()
        
        if success:
            stats = _pdf_processor.get_summary_stats()
            logger.info(f"PDF processor initialized successfully: {stats}")
        else:
            logger.error("Failed to initialize PDF processor")
            _pdf_processor = None
            
        return success
        
    except Exception as e:
        logger.error(f"Error initializing PDF processor: {e}")
        _pdf_processor = None
        return False