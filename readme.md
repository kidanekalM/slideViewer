# SlideViewer PDF Generator

A simple workflow to convert local HTML slides into **landscape PDFs** and merge them into a **single combined PDF**, using **Google Chrome headless** and **Python**. No heavy dependencies or Docker required.

---

## Features

* Converts HTML slides to **landscape PDFs**.
* Handles **remote assets** and modern CSS (like Tailwind).
* **Parallel processing** for faster PDF generation.
* Automatically merges PDFs into **one final file**.
* Cross-platform (macOS/Linux) using Chrome.

---

## Requirements

* **macOS** or Linux
* **Google Chrome** installed
* **Python 3.12+** (tested with 3.12)
* Python packages (install in virtual environment):

```bash
python -m venv venv
source venv/bin/activate
pip install PyPDF2
```

---

## Project Structure

```
slideViewer/
│
├─ slides/               # Folder containing HTML slides
│   ├─ slide1.html
│   ├─ slide2.html
│   └─ ...
│
├─ slides/pdf_output/    # Folder for generated individual PDFs
├─ generate_pdf.sh       # Shell script to convert slides to PDFs
├─ merge_pdfs.py         # Python script to merge PDFs into one
└─ README.md             # This file
```

---

## Usage

### Step 1 — Generate PDFs from slides

Run the shell script:

```bash
chmod +x generate_pdf.sh
./generate_pdf.sh
```

* This converts each HTML slide in `slides/` into a **landscape PDF** in `slides/pdf_output/`.
* Adjust **`PARALLEL`** in the script to control concurrent Chrome processes.

---

### Step 2 — Merge PDFs

Activate your Python virtual environment:

```bash
source venv/bin/activate
python merge_pdfs.py
```

* This creates a **single combined PDF**: `slides/slides_combined.pdf`.
* Slides are merged **in correct numeric order**.

---

## Notes

* For proper **landscape layout**, ensure each HTML slide includes:

```html
<style>
@page {
    size: A4 landscape;
    margin: 0;
}
</style>
```

* Chrome must be accessible at the path specified in `generate_pdf.sh`:

```bash
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

* Works best with **numbered filenames** like `1.html`, `2.html`, `10.html` for correct merging.

---

## Optional Improvements

* Automatically inject `@page { size: A4 landscape; }` if missing.
* Merge PDFs **directly in shell** without Python if `pdfunite` or `gs` is available.
* Add **compression** or **bookmarks** in the final PDF.

---

✅ Now you can generate high-quality, landscape, merged PDFs from your HTML slides easily!

---

If you want, I can also make a **single combined script** that does:

* Conversion to PDFs
* Automatic merging
* Ensures numeric ordering

…so the user just runs **one command** and everything is done.

Do you want me to do that?
