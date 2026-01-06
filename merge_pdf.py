import os
from PyPDF2 import PdfMerger
import re

INPUT_DIR = "slides/pdf_output"
OUTPUT_FILE = "slides/slides_combined.pdf"

def extract_number(filename):
    """Extract number from filenames like slide_1.pdf or 1.pdf"""
    match = re.search(r'(\d+)', filename)
    return int(match.group(1)) if match else float('inf')

# Sort files numerically based on slide number
pdf_files = sorted(
    [os.path.join(INPUT_DIR, f) for f in os.listdir(INPUT_DIR) if f.endswith(".pdf")],
    key=lambda x: extract_number(os.path.basename(x))
)

merger = PdfMerger()
for pdf in pdf_files:
    merger.append(pdf)

merger.write(OUTPUT_FILE)
merger.close()

print(f"✅ Combined PDF created in correct order: {OUTPUT_FILE}")
