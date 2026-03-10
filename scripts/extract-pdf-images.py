#!/usr/bin/env python3
"""
PDF Image Extraction Script
Extracts images from PDF files and saves them to a specified output directory.
"""

import fitz  # PyMuPDF
import os
import sys
from pathlib import Path

def extract_images_from_pdf(pdf_path: str, output_dir: str = "extracted_images", page_num: int = None):
    """
    Extract images from a PDF file.
    
    Args:
        pdf_path: Path to the PDF file
        output_dir: Directory to save extracted images
        page_num: Optional specific page number to extract from (0-indexed). If None, extracts from all pages.
    """
    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Open the PDF
    doc = fitz.open(pdf_path)
    pdf_name = Path(pdf_path).stem
    
    print(f"PDF: {pdf_path}")
    print(f"Total pages: {len(doc)}")
    print(f"Output directory: {output_dir}")
    print("-" * 50)
    
    image_count = 0
    
    # Determine which pages to process
    if page_num is not None:
        pages_to_process = [page_num] if 0 <= page_num < len(doc) else []
        if not pages_to_process:
            print(f"Error: Page {page_num} does not exist. PDF has {len(doc)} pages (0-{len(doc)-1})")
            return
    else:
        pages_to_process = range(len(doc))
    
    for page_idx in pages_to_process:
        page = doc[page_idx]
        image_list = page.get_images(full=True)
        
        print(f"\nPage {page_idx + 1}: Found {len(image_list)} images")
        
        for img_idx, img in enumerate(image_list):
            xref = img[0]  # XREF of the image
            
            try:
                # Extract image
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                width = base_image["width"]
                height = base_image["height"]
                colorspace = base_image.get("colorspace", "unknown")
                
                # Generate filename
                filename = f"{pdf_name}_page{page_idx + 1}_img{img_idx + 1}.{image_ext}"
                filepath = output_path / filename
                
                # Save image
                with open(filepath, "wb") as f:
                    f.write(image_bytes)
                
                # Calculate file size
                file_size_kb = len(image_bytes) / 1024
                
                print(f"  - {filename}")
                print(f"    Dimensions: {width}x{height}")
                print(f"    Format: {image_ext.upper()}")
                print(f"    Size: {file_size_kb:.1f} KB")
                print(f"    Colorspace: {colorspace}")
                
                image_count += 1
                
            except Exception as e:
                print(f"  - Error extracting image {img_idx + 1}: {str(e)}")
    
    doc.close()
    
    print("\n" + "=" * 50)
    print(f"Total images extracted: {image_count}")
    print(f"Saved to: {output_path.absolute()}")
    
    return image_count

if __name__ == "__main__":
    # Default: extract from first page only for testing
    pdf_file = "user_read_only_context/text_attachments/r3_NELSON-Office-Repositioning-&-Amentities-5NgUh.pdf"
    
    # Check if PDF exists
    if not os.path.exists(pdf_file):
        print(f"Error: PDF file not found at {pdf_file}")
        sys.exit(1)
    
    # Extract images from page 1 only (index 0) for testing
    print("Extracting images from PAGE 1 ONLY (test run)...")
    print("=" * 50)
    
    extract_images_from_pdf(
        pdf_path=pdf_file,
        output_dir="public/extracted-images",
        page_num=0  # First page only
    )
