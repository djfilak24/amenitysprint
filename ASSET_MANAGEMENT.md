# Asset Management & Image Scraping Strategy

## Overview
This document outlines the three approaches for managing project imagery across the NELSON Amenity Sprint platform.

---

## 1. **Vercel Blob Storage** (Primary Method)

### What it is
Vercel Blob is serverless, public file storage that automatically scales. Files are stored with CDN delivery and don't expire.

### Setup Complete ✓
- **Upload API**: `/app/api/blob/upload/route.ts` - Accepts file uploads with folder organization
- **List API**: `/app/api/blob/list/route.ts` - Lists all uploaded files

### Usage

#### Upload via API
```bash
curl -X POST http://localhost:3000/api/blob/upload \
  -F "file=@sketch.png" \
  -F "folder=sketches/2025"
```

#### Upload from UI (Example)
```jsx
const handleUpload = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', 'studies/one-financial-center')
  
  const response = await fetch('/api/blob/upload', {
    method: 'POST',
    body: formData,
  })
  
  const { url } = await response.json()
  console.log('Image available at:', url)
}
```

#### List all files
```bash
curl http://localhost:3000/api/blob/list
```

### Benefits
- ✓ Persistent cloud storage (never expires)
- ✓ Organized by folder structure
- ✓ Public URLs for web use
- ✓ Scales automatically with your needs
- ✓ No additional setup required (already configured)

---

## 2. **PDF Image Extraction** (Batch Processing)

### Script Location
`/scripts/extract-pdf-images.py`

### Current Status
Script created but requires system dependencies. Python environment setup in sandbox has limitations.

### For Local/Manual Use
```bash
cd scripts
pip install pdf2image Pillow
python extract-pdf-images.py
```

### What it does
- Extracts page 1 of PDF at 300 DPI (high quality)
- Saves as PNG to `public/extracted-images/`
- Logs file dimensions and sizes

### Next Steps if Proceeding
1. Run script locally or in CI/CD pipeline
2. Upload extracted images to Blob storage using the upload API
3. Update project records with new URLs

### Benefits
- ✓ Batch process multiple PDFs
- ✓ Extract structured project data
- ✓ High-quality rasterization

### Challenges
- Requires `poppler-utils` system dependency
- May degrade complex layouts from InDesign
- Better for simple 1-2 page extracts than full docs

---

## 3. **NELSON Website Image Scraping** (Sustainable)

### Why This Approach
- ✓ Images already hosted on nelsonworldwide.com
- ✓ Always available (no redundancy needed)
- ✓ No bandwidth cost (served from NELSON CDN)
- ✓ Works at scale without storage limits

### Found NELSON Projects
These are actual Asset Strategy & Repositioning projects on the NELSON website:

1. **One Financial Center** (Boston, MA)
   - Lobby repositioning with glass atrium
   - URL: https://nelsonworldwide.com/project/one-financial-center/
   - Expertise: Asset Strategy & Repositioning

2. **LaSalle Plaza** (Minneapolis, MN)
   - Dynamic flexible speculative suites
   - URL: https://nelsonworldwide.com/project/lasalle-plaza/
   - Expertise: Asset Strategy & Repositioning

3. **NELSON Worldwide Offices** (Minneapolis, MN)
   - 28th floor office repositioning
   - URL: https://nelsonworldwide.com/project/nelson-worldwide-offices-minneapolis/
   - Expertise: Workplace, Asset Strategy

### Implementation

#### Option A: Direct Website Image URLs
Many NELSON projects display images you can link directly to their WordPress CDN:
```
https://nelsonworldwide.com/wp-content/uploads/[year]/[month]/[project-name].[ext]
```

#### Option B: Metadata + Image Import
Create a data structure mapping to NELSON projects:

```javascript
const NELSON_PROJECTS = [
  {
    name: "One Financial Center",
    location: "Boston, MA",
    url: "https://nelsonworldwide.com/project/one-financial-center/",
    expertise: ["Asset Strategy", "Repositioning", "Interior Design"],
    heroImage: "https://nelsonworldwide.com/wp-content/uploads/...jpg",
  },
  // ... more projects
]
```

### Benefits
- ✓ Always up-to-date (links to live site)
- ✓ Zero storage cost
- ✓ Attribution via backlinks to NELSON
- ✓ Scalable to unlimited projects
- ✓ Perfect for reference & inspiration galleries

---

## Recommended Workflow

### For Your Sketch Covers (9 Studies)
→ Use **Blob Storage**
- You own these assets
- Need to manage versions
- Want fast, reliable access

### For Client-Facing Galleries
→ Use **Website Scraping**
- Reference NELSON's live projects
- Link back to full project pages
- Minimal maintenance

### For InDesign PDFs (Future)
→ Use **PDF Extraction** (optional)
- Extract key pages as reference
- Upload to Blob
- Useful for archival, not frontend

---

## Files Created

| File | Purpose |
|------|---------|
| `/app/api/blob/upload/route.ts` | Upload images to Blob storage |
| `/app/api/blob/list/route.ts` | List all files in Blob storage |
| `/scripts/extract-pdf-images.py` | Extract images from PDFs (local use) |
| `/scripts/pyproject.toml` | Python dependencies for extraction |

---

## Testing the Setup

### 1. Upload a Test Image
```bash
# Using your sketch images
curl -X POST http://localhost:3000/api/blob/upload \
  -F "file=@CBRE-Concourse.png" \
  -F "folder=studies/2025-Q1"
```

### 2. List Uploaded Files
```bash
curl http://localhost:3000/api/blob/list | json_pp
```

### 3. Use the Returned URL
The upload API returns a public URL you can use in images, backgrounds, or reference links.

---

## Next Steps

1. **Test Blob upload** with one of your sketch images
2. **Scrape NELSON website** to build a project reference database
3. **Decide on PDF extraction** - proceed only if you have local Python setup
4. **Create asset management UI** for bulk uploads (future enhancement)
