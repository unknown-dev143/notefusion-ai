"""
Script to check the security status of the application.
"""
import os
import sys
import subprocess
import platform
import socket
import ssl
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional

class SecurityChecker:
    """Class to check the security status of the application."""
    
    def __init__(self):
        self.checks = []
        self.env_path = Path(__file__).parent.parent / '.env'
        self.docker_compose_path = Path(__file__).parent.parent / 'docker-compose.yml'
        self.requirements_path = Path(__file__).parent.parent / 'requirements-updated.txt'
    
    def add_check(self, name: str, status: bool, message: str, critical: bool = False):
        """Add a check result."""
        self.checks.append({
            'name': name,
            'status': '✅' if status else '❌',
            'message': message,
            'critical': critical
        })
    
    def check_environment_file(self) -> bool:
        """Check if the .env file exists and is secure."""
        if not self.env_path.exists():
            self.add_check(
                "Environment File",
                False,
                f".env file not found at {self.env_path}",
                True
            )
            return False
        
        # Check file permissions
        try:
            mode = os.stat(self.env_path).st_mode
            if mode & 0o777 != 0o600:
                self.add_check(
                    "Environment File Permissions",
                    False,
                    f"Insecure permissions on .env file: {oct(mode)[-3:]}. Should be 600",
                    True
                )
                return False
            
            self.add_check(
                "Environment File",
                True,
                f".env file found at {self.env_path} with secure permissions"
            )
            return True
            
        except Exception as e:
            self.add_check(
                "Environment File Check",
                False,
                f"Error checking .env file: {str(e)}",
                True
            )
            return False
    
    def check_docker_running(self) -> bool:
        """Check if Docker is running."""
        try:
            result = subprocess.run(
                ["docker", "info"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            if result.returncode != 0:
                self.add_check(
                    "Docker Status",
                    False,
                    "Docker is not running or not installed",
                    True
                )
                return False
            
            self.add_check(
                "Docker Status",
                True,
                "Docker is running"
            )
            return True
            
        except FileNotFoundError:
            self.add_check(
                "Docker Status",
                False,
                "Docker is not installed",
                True
            )
            return False
    
    def check_containers_running(self) -> bool:
        """Check if all required containers are running."""
        if not self.docker_compose_path.exists():
            self.add_check(
                "Docker Compose",
                False,
                f"docker-compose.yml not found at {self.docker_compose_path}",
                True
            )
            return False
        
        try:
            result = subprocess.run(
                ["docker-compose", "ps", "--services", "--filter", "status=running"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=self.docker_compose_path.parent
            )
            
            if result.returncode != 0:
                self.add_check(
                    "Docker Containers",
                    False,
                    f"Error checking running containers: {result.stderr}",
                    True
                )
                return False
            
            running_services = [s.strip() for s in result.stdout.splitlines() if s.strip()]
            
            # Get list of services from docker-compose.yml
            with open(self.docker_compose_path, 'r') as f:
                import yaml
                try:
                    compose_config = yaml.safe_load(f)
                    all_services = list(compose_config.get('services', {}).keys())
                except yaml.YAMLError as e:
                    self.add_check(
                        "Docker Compose",
                        False,
                        f"Error parsing docker-compose.yml: {str(e)}",
                        True
                    )
                    return False
            
            # Check if all required services are running
            missing_services = [s for s in all_services if s not in running_services]
            
            if missing_services:
                self.add_check(
                    "Docker Containers",
                    False,
                    f"Some services are not running: {', '.join(missing_services)}",
                    True
                )
                return False
            
            self.add_check(
                "Docker Containers",
                True,
                f"All services running: {', '.join(running_services)}"
            )
            return True
            
        except Exception as e:
            self.add_check(
                "Docker Containers",
                False,
                f"Error checking containers: {str(e)}",
                True
            )
            return False
    
    def check_ports(self) -> bool:
        """Check if required ports are open."""
        ports_to_check = [8000, 5432, 6379]  # FastAPI, PostgreSQL, Redis
        open_ports = []
        closed_ports = []
        
        for port in ports_to_check:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex(('127.0.0.1', port))
            sock.close()
            
            if result == 0:
                open_ports.append(port)
            else:
                closed_ports.append(port)
        
        if closed_ports:
            self.add_check(
                "Open Ports",
                False,
                f"Some required ports are closed: {', '.join(map(str, closed_ports))}",
                True
            )
            return False
        
        self.add_check(
            "Open Ports",
            True,
            f"All required ports are open: {', '.join(map(str, open_ports))}"
        )
        return True
    
    def check_ssl_certificate(self) -> bool:
        """Check if SSL certificate is valid."""
        try:
            # This is a basic check - in production, you'd check your actual domain
            context = ssl.create_default_context()
            with socket.create_connection(('google.com', 443)) as sock:
                with context.wrap_socket(sock, server_hostname='google.com') as ssock:
                    cert = ssock.getpeercert()
                    
            self.add_check(
                "SSL Certificate",
                True,
                "SSL certificate validation successful"
            )
            return True
            
        except Exception as e:
            self.add_check(
                "SSL Certificate",
                False,
                f"SSL certificate validation failed: {str(e)}",
                True
            )
            return False
    
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
                self.add_check(
                    "Dependencies",
                    False,
                    "safety is not installed. Run 'pip install safety' to check for vulnerabilities.",
                    True
                )
                return False
            
            # Run safety check
            result = subprocess.run(
                ["safety", "check", "--json", "--file", str(self.requirements_path)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            if result.returncode != 0:
                try:
                    vulnerabilities = json.loads(result.stdout)
                    vuln_count = len(vulnerabilities)
                    self.add_check(
                        "Dependencies",
                        False,
                        f"Found {vuln_count} vulnerabilities in dependencies. Run 'safety check' for details.",
                        True
                    )
                    return False
                except json.JSONDecodeError:
                    self.add_check(
                        "Dependencies",
                        False,
                        f"Error parsing safety output: {result.stderr}",
                        True
                    )
                    return False
            
            self.add_check(
                "Dependencies",
                True,
                "No known vulnerabilities found in dependencies"
            )
            return True
            
        except Exception as e:
            self.add_check(
                "Dependencies",
                False,
                f"Error checking dependencies: {str(e)}",
                True
            )
            return False
    
    def run_checks(self) -> bool:
        """Run all security checks."""
        print("🔒 Running security checks...\n")
        
        # Run all checks
        self.check_environment_file()
        self.check_docker_running()
        self.check_containers_running()
        self.check_ports()
        self.check_ssl_certificate()
        self.check_dependencies()
        
        # Print results
        for check in self.checks:
            print(f"{check['status']} {check['name']}: {check['message']}")
        
        # Check if any critical checks failed
        critical_failures = [c for c in self.checks if not c['status'] and c['critical']]
        
        print("\n📊 Summary:")
        print(f"Total checks: {len(self.checks)}")
        print(f"Passed: {sum(1 for c in self.checks if c['status'])}")
        print(f"Failed: {sum(1 for c in self.checks if not c['status'])}")
        print(f"Critical failures: {len(critical_failures)}")
        
        if critical_failures:
            print("\n❌ Critical issues found. Please address them immediately.")
            return False
        
        print("\n✅ All security checks passed!")
        return True

def main() -> int:
    """Main function to run security checks."""
    checker = SecurityChecker()
    success = checker.run_checks()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
