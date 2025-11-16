import whisper

# Load model once globally
_model = whisper.load_model("base")  # use "tiny" for faster but lower quality

def transcribe_chunk(filepath: str) -> str:
    result = _model.transcribe(filepath)
    return result.get("text", "")

def extract_text_from_pdf(raw_bytes: bytes) -> str:
    import fitz  # PyMuPDF
    text = ""
    doc = fitz.open(stream=raw_bytes, filetype="pdf")
    for page in doc:
        text += page.get_text()
    return text
