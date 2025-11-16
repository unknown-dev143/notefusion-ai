"""
Content Security Policy (CSP) configuration.

This module provides utilities for managing Content Security Policy headers
and nonce generation for script and style tags.
"""
from typing import Dict, List, Optional, Set, Union
import base64
import secrets

class ContentSecurityPolicy:
    """Manages Content Security Policy directives."""
    
    def __init__(
        self,
        default_src: Optional[List[str]] = None,
        script_src: Optional[List[str]] = None,
        style_src: Optional[List[str]] = None,
        img_src: Optional[List[str]] = None,
        connect_src: Optional[List[str]] = None,
        font_src: Optional[List[str]] = None,
        object_src: Optional[List[str]] = None,
        media_src: Optional[List[str]] = None,
        frame_src: Optional[List[str]] = None,
        sandbox: Optional[List[str]] = None,
        report_uri: Optional[str] = None,
        report_to: Optional[str] = None,
        upgrade_insecure_requests: bool = False,
        block_all_mixed_content: bool = False,
        require_sri_for: Optional[List[str]] = None,
        enable_trusted_types: bool = True,
        enable_strict_dynamic: bool = True,
        nonce_length: int = 32,
    ):
        """Initialize the CSP configuration.
        
        Args:
            default_src: Fallback for other fetch directives
            script_src: Valid sources for JavaScript
            style_src: Valid sources for CSS
            img_src: Valid sources for images
            connect_src: Valid sources for XHR, WebSockets, etc.
            font_src: Valid sources for fonts
            object_src: Valid sources for <object>, <embed>, and <applet>
            media_src: Valid sources for <audio> and <video>
            frame_src: Valid sources for <frame> and <iframe>
            sandbox: Sandbox restrictions
            report_uri: URI to send violation reports to
            report_to: Reporting API endpoint
            upgrade_insecure_requests: Whether to upgrade HTTP to HTTPS
            block_all_mixed_content: Whether to block mixed content
            require_sri_for: Require SRI for specified resource types
            enable_trusted_types: Enable Trusted Types API
            enable_strict_dynamic: Enable strict-dynamic for script-src
            nonce_length: Length of generated nonces in bytes
        """
        self.directives: Dict[str, Set[str]] = {}
        self.nonce_length = nonce_length
        
        # Set default directives
        self.set_directive('default-src', default_src or ["'self'"])  # type: ignore
        
        # Set other directives
        self.set_directive('script-src', script_src or ["'self'"])  # type: ignore
        self.set_directive('style-src', style_src or ["'self'"])  # type: ignore
        self.set_directive('img-src', img_src or ["'self'"])  # type: ignore
        self.set_directive('connect-src', connect_src or ["'self'"])  # type: ignore
        self.set_directive('font-src', font_src or ["'self'"])  # type: ignore
        self.set_directive('object-src', object_src or ["'none'"])  # type: ignore
        self.set_directive('media-src', media_src or ["'self'"])  # type: ignore
        self.set_directive('frame-src', frame_src or ["'self'"])  # type: ignore
        
        # Security features
        if upgrade_insecure_requests:
            self.directives['upgrade-insecure-requests'] = set()
            
        if block_all_mixed_content:
            self.directives['block-all-mixed-content'] = set()
            
        if enable_trusted_types:
            self.set_directive('trusted-types', ['*'])
            
        if enable_strict_dynamic and 'script-src' in self.directives:
            self.directives['script-src'].add("'strict-dynamic'")
            
        if require_sri_for:
            self.set_directive('require-sri-for', require_sri_for)
            
        # Reporting
        if report_uri:
            self.set_directive('report-uri', [report_uri])
            
        if report_to:
            self.set_directive('report-to', [report_to])
    
    def set_directive(self, name: str, values: Union[List[str], str, None]) -> None:
        """Set a CSP directive.
        
        Args:
            name: The directive name (e.g., 'script-src')
            values: List of values or a single value string
        """
        if values is None:
            return
            
        if isinstance(values, str):
            values = [values]
            
        self.directives[name] = set(values)
    
    def add_to_directive(self, name: str, values: Union[List[str], str]) -> None:
        """Add values to an existing directive.
        
        Args:
            name: The directive name
            values: Values to add
        """
        if isinstance(values, str):
            values = [values]
            
        if name not in self.directives:
            self.directives[name] = set()
            
        self.directives[name].update(values)
    
    def remove_from_directive(self, name: str, values: Union[List[str], str]) -> None:
        """Remove values from a directive.
        
        Args:
            name: The directive name
            values: Values to remove
        """
        if name not in self.directives:
            return
            
        if isinstance(values, str):
            values = [values]
            
        self.directives[name] -= set(values)
    
    def generate_nonce(self) -> str:
        """Generate a random nonce value.
        
        Returns:
            str: A base64-encoded nonce
        """
        return base64.b64encode(secrets.token_bytes(self.nonce_length)).decode('ascii')
    
    def get_header(self, nonce: Optional[str] = None) -> str:
        """Generate the CSP header string.
        
        Args:
            nonce: Optional nonce value to include in script-src and style-src
            
        Returns:
            str: The CSP header value
        """
        directives = []
        
        # Make a copy of directives to modify
        csp_directives = {k: v.copy() for k, v in self.directives.items()}
        
        # Add nonce to script-src and style-src if provided
        if nonce:
            nonce_value = f"'nonce-{nonce}'"
            
            if 'script-src' in csp_directives:
                csp_directives['script-src'].add(nonce_value)
                
            if 'style-src' in csp_directives:
                csp_directives['style-src'].add(nonce_value)
        
        # Build the header string
        for directive, sources in csp_directives.items():
            if not sources and directive not in ['upgrade-insecure-requests', 'block-all-mixed-content']:
                continue
                
            if directive in ['upgrade-insecure-requests', 'block-all-mixed-content']:
                directives.append(directive)
            else:
                directives.append(f"{directive} {' '.join(sources)}")
        
        return "; ".join(directives)
    
    def __str__(self) -> str:
        """Get the CSP header string."""
        return self.get_header()


def get_default_csp() -> ContentSecurityPolicy:
    """Get a secure default CSP configuration."""
    return ContentSecurityPolicy(
        default_src=["'none'"],
        script_src=["'self'", "'unsafe-inline'"],
        style_src=["'self'", "'unsafe-inline'"],
        img_src=["'self'", "data:", "https:"],
        connect_src=["'self'"],
        font_src=["'self'", "data:"],
        object_src=["'none'"],
        media_src=["'self'"],
        frame_src=["'self'"],
        sandbox=["allow-forms", "allow-scripts", "allow-same-origin"],
        upgrade_insecure_requests=True,
        block_all_mixed_content=True,
        require_sri_for=["script", "style"],
        enable_trusted_types=True,
        enable_strict_dynamic=True
    )
