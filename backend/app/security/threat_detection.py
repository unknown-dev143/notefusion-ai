"""Advanced Threat Detection and Prevention System."""
import ipaddress
import re
import json
import time
import logging
from typing import Dict, List, Set, Optional, Any, Tuple
from datetime import datetime, timedelta
from collections import defaultdict, deque
from dataclasses import dataclass
from enum import Enum
import hashlib
import requests
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

logger = logging.getLogger(__name__)

class ThreatType(Enum):
    """Types of security threats."""
    IP_BLACKLIST = "ip_blacklist"
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    SUSPICIOUS_PATTERN = "suspicious_pattern"
    BOT_DETECTION = "bot_detection"
    SQL_INJECTION = "sql_injection"
    XSS_ATTEMPT = "xss_attempt"
    CSRF_ATTEMPT = "csrf_attempt"
    DDOS_ATTACK = "ddos_attack"
    BRUTE_FORCE = "brute_force"
    ANOMALOUS_BEHAVIOR = "anomalous_behavior"

@dataclass
class ThreatEvent:
    """Threat event data structure."""
    threat_type: ThreatType
    source_ip: str
    timestamp: datetime
    user_agent: str
    request_path: str
    method: str
    severity: str  # low, medium, high, critical
    details: Dict[str, Any]
    blocked: bool = False

class IPBlacklist:
    """IP blacklist management."""
    
    def __init__(self):
        self.blacklisted_ips: Set[str] = set()
        self.whitelisted_ips: Set[str] = set()
        self.temp_blacklist: Dict[str, datetime] = {}
        self.load_lists()
    
    def load_lists(self):
        """Load IP lists from storage/database."""
        # Load from database or config file
        # For now, initialize with some known malicious IPs
        known_malicious = [
            "192.168.1.100",  # Example malicious IP
            "10.0.0.50",      # Example malicious IP
        ]
        self.blacklisted_ips.update(known_malicious)
        
        # Load whitelisted IPs (internal, trusted)
        trusted_ips = [
            "127.0.0.1",
            "::1",
        ]
        self.whitelisted_ips.update(trusted_ips)
    
    def is_blacklisted(self, ip: str) -> bool:
        """Check if IP is blacklisted."""
        if ip in self.whitelisted_ips:
            return False
        
        if ip in self.blacklisted_ips:
            return True
        
        # Check temporary blacklist
        if ip in self.temp_blacklist:
            if datetime.now() < self.temp_blacklist[ip]:
                return True
            else:
                del self.temp_blacklist[ip]
        
        return False
    
    def add_to_blacklist(self, ip: str, duration_hours: int = 24):
        """Add IP to temporary blacklist."""
        expiry = datetime.now() + timedelta(hours=duration_hours)
        self.temp_blacklist[ip] = expiry
    
    def add_to_permanent_blacklist(self, ip: str):
        """Add IP to permanent blacklist."""
        self.blacklisted_ips.add(ip)

class BotDetector:
    """Bot detection and identification."""
    
    def __init__(self):
        self.bot_patterns = [
            r'bot',
            r'crawler',
            r'spider',
            r'scraper',
            r'curl',
            r'wget',
            r'python',
            r'java',
            r'go-http',
            r'postman',
            r'insomnia'
        ]
        self.bot_signatures = [
            'Mozilla/5.0 (compatible; Googlebot',
            'Mozilla/5.0 (compatible; bingbot',
            'Mozilla/5.0 (compatible; YandexBot',
            'facebookexternalhit',
            'Twitterbot',
            'LinkedInBot'
        ]
    
    def is_bot(self, user_agent: str, request_headers: Dict[str, str]) -> Tuple[bool, str]:
        """Detect if request is from a bot."""
        user_agent_lower = user_agent.lower()
        
        # Check for known bot signatures
        for signature in self.bot_signatures:
            if signature.lower() in user_agent_lower:
                return True, f"Known bot: {signature}"
        
        # Check for bot patterns
        for pattern in self.bot_patterns:
            if re.search(pattern, user_agent_lower, re.IGNORECASE):
                return True, f"Bot pattern detected: {pattern}"
        
        # Check for missing common browser headers
        required_headers = ['accept', 'accept-language', 'accept-encoding']
        missing_headers = [h for h in required_headers if h not in request_headers]
        if len(missing_headers) > 1:
            return True, f"Missing browser headers: {missing_headers}"
        
        # Check for automated tool characteristics
        if 'application/json' in request_headers.get('accept', '') and 'xmlhttprequest' in user_agent_lower:
            return True, "Likely automated request"
        
        return False, ""

class SQLInjectionDetector:
    """SQL injection attempt detection."""
    
    def __init__(self):
        self.sql_patterns = [
            r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)",
            r"(\b(OR|AND)\s+\d+\s*=\s*\d+)",
            r"(\b(OR|AND)\s+['\"]?\w+['\"]?\s*=\s*['\"]?\w+['\"]?)",
            r"(--|#|\/\*|\*\/)",
            r"(\b(HEX|CHAR|ASCII|ORD|CONCAT|SUBSTRING)\b)",
            r"(\b(INFORMATION_SCHEMA|SYS|MASTER|MSDB)\b)",
            r"(\b(WAITFOR\s+DELAY|BENCHMARK|SLEEP)\b)",
            r"(\b(LOAD_FILE|INTO\s+OUTFILE|DUMPFILE)\b)"
        ]
    
    def detect_sql_injection(self, data: str) -> Tuple[bool, str]:
        """Detect SQL injection attempts."""
        if not data:
            return False, ""
        
        data_upper = data.upper()
        
        for pattern in self.sql_patterns:
            if re.search(pattern, data_upper, re.IGNORECASE | re.MULTILINE):
                return True, f"SQL injection pattern detected: {pattern}"
        
        return False, ""

class XSSDetector:
    """Cross-site scripting attempt detection."""
    
    def __init__(self):
        self.xss_patterns = [
            r"<script[^>]*>.*?</script>",
            r"javascript:",
            r"on\w+\s*=",
            r"<iframe[^>]*>",
            r"<object[^>]*>",
            r"<embed[^>]*>",
            r"<link[^>]*>",
            r"<meta[^>]*>",
            r"expression\s*\(",
            r"@import",
            r"<\?php",
            r"<%.*%>"
        ]
    
    def detect_xss(self, data: str) -> Tuple[bool, str]:
        """Detect XSS attempts."""
        if not data:
            return False, ""
        
        for pattern in self.xss_patterns:
            if re.search(pattern, data, re.IGNORECASE | re.MULTILINE | re.DOTALL):
                return True, f"XSS pattern detected: {pattern}"
        
        return False, ""

class DDoSProtection:
    """DDoS attack protection."""
    
    def __init__(self):
        self.request_counts: Dict[str, deque] = defaultdict(lambda: deque(maxlen=1000))
        self.rate_limits = {
            'default': 100,  # requests per minute
            'auth': 5,       # auth endpoints
            'api': 200,      # api endpoints
            'upload': 10     # file uploads
        }
    
    def is_ddos_attack(self, ip: str, endpoint: str) -> Tuple[bool, str]:
        """Check for DDoS patterns."""
        now = time.time()
        window = 60  # 1 minute window
        
        # Get appropriate rate limit
        if '/auth/' in endpoint:
            limit = self.rate_limits['auth']
        elif '/api/' in endpoint:
            limit = self.rate_limits['api']
        elif '/upload' in endpoint:
            limit = self.rate_limits['upload']
        else:
            limit = self.rate_limits['default']
        
        # Clean old requests
        while self.request_counts[ip] and self.request_counts[ip][0] < now - window:
            self.request_counts[ip].popleft()
        
        # Check rate limit
        if len(self.request_counts[ip]) >= limit:
            return True, f"Rate limit exceeded: {len(self.request_counts[ip])}/{limit} per minute"
        
        # Add current request
        self.request_counts[ip].append(now)
        return False, ""

class AnomalyDetector:
    """Behavioral anomaly detection."""
    
    def __init__(self):
        self.user_patterns: Dict[str, Dict] = defaultdict(lambda: {
            'endpoints': defaultdict(int),
            'request_times': deque(maxlen=100),
            'user_agents': set(),
            'ip_addresses': set(),
            'session_duration': deque(maxlen=50)
        })
    
    def detect_anomaly(self, user_id: Optional[str], ip: str, endpoint: str, 
                       user_agent: str, request_time: float) -> Tuple[bool, str]:
        """Detect behavioral anomalies."""
        if not user_id:
            return False, ""
        
        patterns = self.user_patterns[user_id]
        
        # Check for unusual endpoints
        patterns['endpoints'][endpoint] += 1
        if len(patterns['endpoints']) > 100:  # Too many different endpoints
            return True, "Unusual endpoint access pattern"
        
        # Check for unusual request times
        patterns['request_times'].append(request_time)
        if len(patterns['request_times']) > 10:
            avg_time = sum(patterns['request_times']) / len(patterns['request_times'])
            if request_time > avg_time * 5:  # Much slower than usual
                return True, "Unusually slow request processing"
        
        # Check for new IP addresses
        patterns['ip_addresses'].add(ip)
        if len(patterns['ip_addresses']) > 5:  # Too many different IPs
            return True, "Multiple IP addresses detected"
        
        # Check for new user agents
        patterns['user_agents'].add(user_agent)
        if len(patterns['user_agents']) > 3:  # Too many different user agents
            return True, "Multiple user agents detected"
        
        return False, ""

class ThreatDetectionMiddleware(BaseHTTPMiddleware):
    """Main threat detection middleware."""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.ip_blacklist = IPBlacklist()
        self.bot_detector = BotDetector()
        self.sql_detector = SQLInjectionDetector()
        self.xss_detector = XSSDetector()
        self.ddos_protection = DDoSProtection()
        self.anomaly_detector = AnomalyDetector()
        self.threat_events: List[ThreatEvent] = []
        
        # Load external threat intelligence
        self.load_threat_intelligence()
    
    def load_threat_intelligence(self):
        """Load threat intelligence from external sources."""
        try:
            # Load from threat intelligence APIs
            # Example: abuse.ch, virustotal, etc.
            pass
        except Exception as e:
            logger.error(f"Failed to load threat intelligence: {e}")
    
    async def dispatch(self, request: Request, call_next):
        """Process request through threat detection."""
        start_time = time.time()
        client_ip = self.get_client_ip(request)
        user_agent = request.headers.get("user-agent", "")
        path = request.url.path
        method = request.method
        
        # Check IP blacklist
        if self.ip_blacklist.is_blacklisted(client_ip):
            await self.log_threat(ThreatEvent(
                threat_type=ThreatType.IP_BLACKLIST,
                source_ip=client_ip,
                timestamp=datetime.now(),
                user_agent=user_agent,
                request_path=path,
                method=method,
                severity="high",
                details={"reason": "IP is blacklisted"},
                blocked=True
            ))
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Check for DDoS
        is_ddos, ddos_reason = self.ddos_protection.is_ddos_attack(client_ip, path)
        if is_ddos:
            await self.log_threat(ThreatEvent(
                threat_type=ThreatType.DDOS_ATTACK,
                source_ip=client_ip,
                timestamp=datetime.now(),
                user_agent=user_agent,
                request_path=path,
                method=method,
                severity="high",
                details={"reason": ddos_reason},
                blocked=True
            ))
            # Temporarily blacklist the IP
            self.ip_blacklist.add_to_blacklist(client_ip, 1)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests"
            )
        
        # Check for bot activity
        is_bot, bot_reason = self.bot_detector.is_bot(user_agent, dict(request.headers))
        if is_bot:
            await self.log_threat(ThreatEvent(
                threat_type=ThreatType.BOT_DETECTION,
                source_ip=client_ip,
                timestamp=datetime.now(),
                user_agent=user_agent,
                request_path=path,
                method=method,
                severity="medium",
                details={"reason": bot_reason},
                blocked=False
            ))
        
        # Check request data for injection attacks
        if method in ["POST", "PUT", "PATCH"]:
            try:
                body = await request.body()
                body_str = body.decode('utf-8', errors='ignore')
                
                # SQL Injection detection
                is_sql, sql_reason = self.sql_detector.detect_sql_injection(body_str)
                if is_sql:
                    await self.log_threat(ThreatEvent(
                        threat_type=ThreatType.SQL_INJECTION,
                        source_ip=client_ip,
                        timestamp=datetime.now(),
                        user_agent=user_agent,
                        request_path=path,
                        method=method,
                        severity="critical",
                        details={"reason": sql_reason, "data_sample": body_str[:200]},
                        blocked=True
                    ))
                    self.ip_blacklist.add_to_blacklist(client_ip, 24)
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid request detected"
                    )
                
                # XSS detection
                is_xss, xss_reason = self.xss_detector.detect_xss(body_str)
                if is_xss:
                    await self.log_threat(ThreatEvent(
                        threat_type=ThreatType.XSS_ATTEMPT,
                        source_ip=client_ip,
                        timestamp=datetime.now(),
                        user_agent=user_agent,
                        request_path=path,
                        method=method,
                        severity="high",
                        details={"reason": xss_reason, "data_sample": body_str[:200]},
                        blocked=True
                    ))
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid request detected"
                    )
                    
            except Exception as e:
                logger.error(f"Error processing request body: {e}")
        
        # Process the request
        response = await call_next(request)
        
        # Calculate processing time
        processing_time = time.time() - start_time
        
        # Check for anomalies (would need user ID from auth)
        user_id = getattr(request.state, 'user_id', None)
        is_anomaly, anomaly_reason = self.anomaly_detector.detect_anomaly(
            user_id, client_ip, path, user_agent, processing_time
        )
        
        if is_anomaly:
            await self.log_threat(ThreatEvent(
                threat_type=ThreatType.ANOMALOUS_BEHAVIOR,
                source_ip=client_ip,
                timestamp=datetime.now(),
                user_agent=user_agent,
                request_path=path,
                method=method,
                severity="medium",
                details={"reason": anomaly_reason},
                blocked=False
            ))
        
        return response
    
    def get_client_ip(self, request: Request) -> str:
        """Get client IP address from request."""
        # Check for forwarded headers
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip
        
        # Fall back to direct connection
        return request.client.host if request.client else "unknown"
    
    async def log_threat(self, event: ThreatEvent):
        """Log threat event."""
        self.threat_events.append(event)
        
        # Log to file/monitoring system
        logger.warning(
            f"THREAT DETECTED: {event.threat_type.value} from {event.source_ip} "
            f"at {event.timestamp} - {event.details}"
        )
        
        # Send alerts for critical threats
        if event.severity in ["high", "critical"]:
            await self.send_security_alert(event)
    
    async def send_security_alert(self, event: ThreatEvent):
        """Send security alert for critical threats."""
        try:
            # Implement alerting (email, Slack, etc.)
            alert_data = {
                "threat_type": event.threat_type.value,
                "source_ip": event.source_ip,
                "severity": event.severity,
                "timestamp": event.timestamp.isoformat(),
                "details": event.details
            }
            logger.critical(f"SECURITY ALERT: {json.dumps(alert_data)}")
        except Exception as e:
            logger.error(f"Failed to send security alert: {e}")
    
    def get_threat_summary(self) -> Dict[str, Any]:
        """Get summary of detected threats."""
        summary = {
            "total_threats": len(self.threat_events),
            "blocked_ips": len(self.ip_blacklist.temp_blacklist) + len(self.ip_blacklist.blacklisted_ips),
            "threat_types": defaultdict(int),
            "recent_threats": []
        }
        
        for event in self.threat_events[-100:]:  # Last 100 threats
            summary["threat_types"][event.threat_type.value] += 1
            if event.severity in ["high", "critical"]:
                summary["recent_threats"].append({
                    "type": event.threat_type.value,
                    "ip": event.source_ip,
                    "time": event.timestamp.isoformat(),
                    "severity": event.severity
                })
        
        return summary
