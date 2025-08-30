"""
Security Audit Script for NoteFusion AI

This script performs various security checks and audits on the application.
It can be run manually or scheduled to run regularly.
"""
import os
import sys
import subprocess
import json
import platform
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

class SecurityAudit:
    """Class to perform security audits and checks."""
    
    def __init__(self):
        self.audit_results = []
        self.root_dir = Path(__file__).parent.parent
        self.env_file = self.root_dir / '.env'
        self.requirements_file = self.root_dir / 'requirements-updated.txt'
        self.audit_log = self.root_dir / 'audit.log'
        
    def log_audit(self, check_name: str, status: bool, message: str, critical: bool = False):
        """Log an audit result."""
        result = {
            'timestamp': datetime.utcnow().isoformat(),
            'check': check_name,
            'status': 'PASS' if status else 'FAIL',
            'critical': critical,
            'message': message
        }
        self.audit_results.append(result)
        
        # Print to console
        status_emoji = '✅' if status else '❌'
        print(f"{status_emoji} {check_name}: {message}")
        
        # Write to log file
        with open(self.audit_log, 'a') as f:
            f.write(json.dumps(result) + '\n')
            
        return status
    
    def check_dependencies(self) -> bool:
        """Check for vulnerable dependencies."""
        try:
            # Check if safety is installed
            try:
                subprocess.run(
                    ["safety", "--version"],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    check=True
                )
            except (subprocess.CalledProcessError, FileNotFoundError):
                return self.log_audit(
                    "Dependency Check",
                    False,
                    "safety is not installed. Run 'pip install safety' to check for vulnerabilities.",
                    True
                )
            
            # Run safety check
            result = subprocess.run(
                ["safety", "check", "--json", "--file", str(self.requirements_file)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            if result.returncode != 0:
                try:
                    vulnerabilities = json.loads(result.stdout)
                    vuln_count = len(vulnerabilities)
                    return self.log_audit(
                        "Dependency Check",
                        False,
                        f"Found {vuln_count} vulnerabilities in dependencies. Run 'safety check' for details.",
                        True
                    )
                except json.JSONDecodeError:
                    return self.log_audit(
                        "Dependency Check",
                        False,
                        f"Error parsing safety output: {result.stderr}",
                        True
                    )
            
            return self.log_audit(
                "Dependency Check",
                True,
                "No known vulnerabilities found in dependencies"
            )
            
        except Exception as e:
            return self.log_audit(
                "Dependency Check",
                False,
                f"Error checking dependencies: {str(e)}",
                True
            )
    
    def check_env_file_permissions(self) -> bool:
        """Check that the .env file has secure permissions."""
        if not self.env_file.exists():
            return self.log_audit(
                "Environment File Permissions",
                False,
                f".env file not found at {self.env_file}",
                True
            )
        
        try:
            if platform.system() == 'Windows':
                # On Windows, we can't easily check file permissions in the same way
                return self.log_audit(
                    "Environment File Permissions",
                    True,
                    "Skipping permission check on Windows"
                )
            
            # On Unix-like systems, check file permissions
            mode = os.stat(self.env_file).st_mode
            if mode & 0o777 != 0o600:
                return self.log_audit(
                    "Environment File Permissions",
                    False,
                    f"Insecure permissions on .env file: {oct(mode)[-3:]}. Should be 600",
                    True
                )
            
            return self.log_audit(
                "Environment File Permissions",
                True,
                ".env file has secure permissions (600)"
            )
            
        except Exception as e:
            return self.log_audit(
                "Environment File Permissions",
                False,
                f"Error checking .env file permissions: {str(e)}",
                True
            )
    
    def check_docker_containers(self) -> bool:
        """Check that all Docker containers are running."""
        try:
            result = subprocess.run(
                ["docker", "ps", "--format", "{{.Names}}\t{{.Status}}"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                check=True
            )
            
            # Get list of expected containers
            expected_containers = [
                'notefusion-db',
                'notefusion-redis',
                'notefusion-backend',
                'notefusion-frontend',
                'prometheus',
                'grafana',
                'node-exporter',
                'cadvisor',
                'redis-exporter',
                'postgres-exporter'
            ]
            
            running_containers = {}
            for line in result.stdout.splitlines():
                if '\t' in line:
                    name, status = line.split('\t', 1)
                    running_containers[name] = status
            
            all_running = True
            for container in expected_containers:
                if container not in running_containers:
                    self.log_audit(
                        f"Container Running - {container}",
                        False,
                        f"Container {container} is not running",
                        True
                    )
                    all_running = False
                elif 'unhealthy' in running_containers[container].lower():
                    self.log_audit(
                        f"Container Health - {container}",
                        False,
                        f"Container {container} is unhealthy: {running_containers[container]}",
                        True
                    )
                    all_running = False
                else:
                    self.log_audit(
                        f"Container Running - {container}",
                        True,
                        f"Container {container} is running: {running_containers[container]}"
                    )
            
            return all_running
            
        except subprocess.CalledProcessError as e:
            return self.log_audit(
                "Docker Containers",
                False,
                f"Error checking Docker containers: {e.stderr}",
                True
            )
        except Exception as e:
            return self.log_audit(
                "Docker Containers",
                False,
                f"Unexpected error checking Docker containers: {str(e)}",
                True
            )
    
    def check_ports(self) -> bool:
        """Check that required ports are open."""
        ports_to_check = [
            (8000, 'Backend API'),
            (5432, 'PostgreSQL'),
            (6379, 'Redis'),
            (3000, 'Frontend'),
            (9090, 'Prometheus'),
            (3001, 'Grafana'),
            (9100, 'Node Exporter'),
            (8080, 'cAdvisor'),
            (9121, 'Redis Exporter'),
            (9187, 'Postgres Exporter')
        ]
        
        all_ports_open = True
        
        for port, service in ports_to_check:
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(1)
                result = sock.connect_ex(('127.0.0.1', port))
                sock.close()
                
                if result == 0:
                    self.log_audit(
                        f"Port {port} - {service}",
                        True,
                        f"Port {port} ({service}) is open"
                    )
                else:
                    self.log_audit(
                        f"Port {port} - {service}",
                        False,
                        f"Port {port} ({service}) is not accessible",
                        service in ['Backend API', 'PostgreSQL', 'Redis']
                    )
                    all_ports_open = False
                    
            except Exception as e:
                self.log_audit(
                    f"Port {port} - {service}",
                    False,
                    f"Error checking port {port}: {str(e)}",
                    True
                )
                all_ports_open = False
        
        return all_ports_open
    
    def check_security_headers(self) -> bool:
        """Check that security headers are properly configured."""
        try:
            import requests
            from urllib.parse import urljoin
            
            base_url = "http://localhost:8000"
            endpoints = ["/api/v1/health", "/api/v1/notes"]
            
            all_headers_ok = True
            
            for endpoint in endpoints:
                url = urljoin(base_url, endpoint)
                try:
                    response = requests.get(url, timeout=5)
                    
                    # Check for required security headers
                    required_headers = [
                        'X-Content-Type-Options',
                        'X-Frame-Options',
                        'X-XSS-Protection',
                        'Content-Security-Policy',
                        'Strict-Transport-Security',
                        'Referrer-Policy'
                    ]
                    
                    missing_headers = [h for h in required_headers if h not in response.headers]
                    
                    if missing_headers:
                        self.log_audit(
                            f"Security Headers - {endpoint}",
                            False,
                            f"Missing security headers: {', '.join(missing_headers)}",
                            True
                        )
                        all_headers_ok = False
                    else:
                        self.log_audit(
                            f"Security Headers - {endpoint}",
                            True,
                            "All security headers are present"
                        )
                        
                except requests.RequestException as e:
                    self.log_audit(
                        f"Security Headers - {endpoint}",
                        False,
                        f"Error checking security headers: {str(e)}",
                        True
                    )
                    all_headers_ok = False
            
            return all_headers_ok
            
        except ImportError:
            return self.log_audit(
                "Security Headers",
                False,
                "requests module not installed. Install with 'pip install requests'.",
                False
            )
        except Exception as e:
            return self.log_audit(
                "Security Headers",
                False,
                f"Unexpected error checking security headers: {str(e)}",
                True
            )
    
    def run_all_checks(self) -> bool:
        """Run all security checks and return overall status."""
        print("🔒 Running security audit...\n")
        
        # Run all checks
        checks = [
            self.check_dependencies,
            self.check_env_file_permissions,
            self.check_docker_containers,
            self.check_ports,
            self.check_security_headers
        ]
        
        results = [check() for check in checks]
        
        # Print summary
        passed = sum(1 for r in results if r)
        total = len(results)
        
        print("\n📊 Audit Summary:")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {total - passed}")
        print(f"📋 Total: {total}")
        
        # Check for critical failures
        critical_failures = [r for r in self.audit_results 
                           if not r['status'] and r.get('critical', False)]
        
        if critical_failures:
            print("\n❌ Critical issues found. Please address them immediately.")
            for failure in critical_failures:
                print(f"- {failure['check']}: {failure['message']}")
            
            # Save detailed report
            report_path = self.root_dir / 'security_audit_report.json'
            with open(report_path, 'w') as f:
                json.dump(self.audit_results, f, indent=2)
            
            print(f"\n📄 Full audit report saved to: {report_path}")
            return False
        
        print("\n✅ Security audit completed successfully!")
        return True

def main() -> int:
    """Run the security audit."""
    try:
        audit = SecurityAudit()
        success = audit.run_all_checks()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\nAudit cancelled by user.")
        return 1
    except Exception as e:
        print(f"\n❌ Error running security audit: {str(e)}")
        return 1

if __name__ == "__main__":
    import socket  # Moved here to fix the NameError in check_ports
    sys.exit(main())
