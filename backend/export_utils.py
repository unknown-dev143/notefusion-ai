import markdown2
from weasyprint import HTML

def markdown_to_pdf(md_text, output_path, diagrams=None):
    html = markdown2.markdown(md_text)
    HTML(string=html).write_pdf(output_path)
