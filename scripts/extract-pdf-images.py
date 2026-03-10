#!/usr/bin/env python3
"""
PDF Image Extraction Script
Converts PDF pages to images and extracts any embedded images.
Uses pdf2image to convert pages to PNG at high quality.
"""

from pdf2image import convert_from_path
from pathlib import Path
import os
import sys

def extract_images_from_pdf(pdf_path: str, output_dir: str = "extracted_images", page_num: int = None):
    """
    Extract images from a PDF file by converting pages to images.
    
    Args:
        pdf_path: Path to the PDF file
        output_dir: Directory to save extracted images
        page_num: Optional specific page number to extract from (1-indexed). If None, extracts from all pages.
    """
    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    pdf_name = Path(pdf_path).stem
    
    print(f"PDF: {pdf_path}")
    print(f"Output directory: {output_dir}")
    print("-" * 50)
    
    try:
        # Get total page count first
        images = convert_from_path(pdf_path, first_page=1, last_page=1, dpi=100)
        
        if page_num is not None:
            # Convert specific page
            print(f"Converting page {page_num} at 300 DPI (high quality)...")
            pages_to_convert = [page_num]
        else:
            # For testing, just convert first page
            pages_to_convert = [1]
            print(f"Converting page 1 at 300 DPI (test run)...")
        
        # Convert at high DPI for quality
        images = convert_from_path(pdf_path, first_page=pages_to_convert[0], last_page=pages_to_convert[0], dpi=300)
        
        for idx, image in enumerate(images, start=1):
            # Save as PNG (highest quality)
            filename = f"{pdf_name}_page{pages_to_convert[0]}.png"
            filepath = output_path / filename
            
            image.save(filepath, "PNG", quality=95)
            
            # Get file info
            file_size_mb = os.path.getsize(filepath) / (1024 * 1024)
            width, height = image.size
            
            print(f"\n✓ Saved: {filename}")
            print(f"  Dimensions: {width}x{height}")
            print(f"  Size: {file_size_mb:.2f} MB")
            print(f"  Format: PNG (300 DPI)")
        
        print("\n" + "=" * 50)
        print(f"Extraction complete!")
        print(f"Saved to: {output_path.absolute()}")
        
        return len(images)
        
    except Exception as e:
        print(f"Error: {str(e)}")
        print("\nNote: Make sure poppler-utils is installed:")
        print("  macOS: brew install poppler")
        print("  Ubuntu: sudo apt-get install poppler-utils")
        print("  Windows: Download from https://github.com/oschwartz10612/poppler-windows/releases")
        return 0

if __name__ == "__main__":
    # Extract from page 1 for testing
    pdf_file = "user_read_only_context/text_attachments/r3_NELSON-Office-Repositioning-&-Amentities-5NgUh.pdf"
    
    # Check if PDF exists
    if not os.path.exists(pdf_file):
        print(f"Error: PDF file not found at {pdf_file}")
        sys.exit(1)
    
    print("Extracting images from PAGE 1 (test run)...")
    print("=" * 50)
    
    extract_images_from_pdf(
        pdf_path=pdf_file,
        output_dir="public/extracted-images",
        page_num=1  # First page
    )
