#!/bin/bash
# generate_landscape_pdf.sh

SLIDES_DIR="slides"
OUTPUT_DIR="$SLIDES_DIR/pdf_output"
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

mkdir -p "$OUTPUT_DIR"

PARALLEL=4
count=0

for f in "$SLIDES_DIR"/*.html; do
    filename=$(basename "$f" .html)
    output="$OUTPUT_DIR/${filename}.pdf"

    # Make sure the path is absolute and spaces are escaped
    file_url="file://$(pwd)/$SLIDES_DIR/$filename.html"

    "$CHROME_PATH" \
        --headless \
        --disable-gpu \
        --print-to-pdf="$output" \
        --print-to-pdf-no-header \
        --virtual-time-budget=1000 \
        "$file_url" &

    ((count++))
    if (( count % PARALLEL == 0 )); then
        wait
    fi
done

wait
echo "✅ All slides converted to PDFs (use @page CSS for landscape)!"
