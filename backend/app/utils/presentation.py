from typing import Optional, Dict, Any, List
from pathlib import Path
import subprocess
from datetime import datetime
import json

class PresentationTemplate:
    def __init__(self, template_dir: str):
        self.template_dir = Path(template_dir)
        self.templates = self._load_templates()

    def _load_templates(self) -> Dict[str, Dict[str, Any]]:
        """Load all template configurations"""
        templates = {}
        for config_file in self.template_dir.glob("*.json"):
            templates[config_file.stem] = json.loads(config_file.read_text())
        return templates

    def get_template(self, name: str) -> Dict[str, Any]:
        """Get template configuration by name"""
        return self.templates.get(name, self.templates.get("default", {}))

class BrandingManager:
    def __init__(self, branding_config: Dict[str, Any]):
        self.config = branding_config
        self._validate_config()

    def _validate_config(self):
        """Validate branding configuration"""
        required_fields = ["logo_path", "colors", "fonts"]
        for field in required_fields:
            if field not in self.config:
                raise ValueError(f"Missing required branding field: {field}")

    def apply_branding(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """Apply branding to content"""
        if "slides" in content:
            for slide in content["slides"]:
                slide["background_color"] = self.config["colors"]["background"]
                slide["font_family"] = self.config["fonts"]["main"]
                if "logo_position" in slide:
                    slide["logo"] = self.config["logo_path"]
        return content

class ExportManager:
    SUPPORTED_FORMATS = {
        "pdf": {"ext": ".pdf", "mime": "application/pdf"},
        "markdown": {"ext": ".md", "mime": "text/markdown"},
        "html": {"ext": ".html", "mime": "text/html"},
        "docx": {"ext": ".docx", "mime": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"},
        "pptx": {"ext": ".pptx", "mime": "application/vnd.openxmlformats-officedocument.presentationml.presentation"}
    }

    @staticmethod
    def export_content(content: Dict[str, Any], format: str, output_dir: str) -> str:
        """Export content to specified format"""
        if format not in ExportManager.SUPPORTED_FORMATS:
            raise ValueError(f"Unsupported format: {format}")

        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = output_dir / f"notes_{timestamp}{ExportManager.SUPPORTED_FORMATS[format]['ext']}"

        if format == "pdf":
            ExportManager._export_pdf(content, output_file)
        elif format == "markdown":
            ExportManager._export_markdown(content, output_file)
        elif format == "html":
            ExportManager._export_html(content, output_file)
        elif format == "docx":
            ExportManager._export_docx(content, output_file)
        elif format == "pptx":
            ExportManager._export_pptx(content, output_file)

        return str(output_file)

    @staticmethod
    def _export_pdf(content: Dict[str, Any], output_file: Path):
        """Export content to PDF"""
        try:
            import weasyprint
            html_content = ExportManager._content_to_html(content)
            weasyprint.HTML(string=html_content).write_pdf(str(output_file))
        except ImportError:
            # Fallback to alternative PDF generation
            markdown_content = ExportManager._content_to_markdown(content)
            subprocess.run(["pandoc", "-f", "markdown", "-t", "pdf", "-o", str(output_file)],
                         input=markdown_content.encode(), check=True)

    @staticmethod
    def _export_markdown(content: Dict[str, Any], output_file: Path):
        """Export content to Markdown"""
        markdown_content = ExportManager._content_to_markdown(content)
        output_file.write_text(markdown_content)

    @staticmethod
    def _content_to_markdown(content: Dict[str, Any]) -> str:
        """Convert content to Markdown format"""
        markdown_parts = []
        
        # Add title
        if "title" in content:
            markdown_parts.append(f"# {content['title']}\n")
        
        # Add metadata
        if "metadata" in content:
            markdown_parts.append("## Metadata\n")
            for key, value in content["metadata"].items():
                markdown_parts.append(f"- **{key}**: {value}\n")
        
        # Add segments
        if "segments" in content:
            current_speaker = None
            for segment in content["segments"]:
                if segment.get("speaker") != current_speaker:
                    current_speaker = segment["speaker"]
                    markdown_parts.append(f"\n### {current_speaker}\n")
                markdown_parts.append(f"{segment['text']}\n")
        
        # Add diagrams
        if "diagrams" in content:
            markdown_parts.append("\n## Diagrams\n")
            for diagram in content["diagrams"]:
                markdown_parts.append(f"\n![{diagram['description']}]({diagram['path']})\n")
                markdown_parts.append(f"*{diagram['description']}*\n")
        
        return "\n".join(markdown_parts)

    @staticmethod
    def _content_to_html(content: Dict[str, Any]) -> str:
        """Convert content to HTML format"""
        markdown_content = ExportManager._content_to_markdown(content)
        try:
            import markdown
            return markdown.markdown(markdown_content)
        except ImportError:
            return f"<pre>{markdown_content}</pre>"
