"""
Setup and configure monitoring for NoteFusion AI

This script helps set up and configure the monitoring stack including:
- Prometheus
- Grafana
- Exporters (Node, cAdvisor, Redis, PostgreSQL)
- Security configurations
"""
import os
import sys
import subprocess
import platform
import shutil
from pathlib import Path
from typing import Optional, Dict, List

class MonitoringSetup:
    """Class to handle monitoring setup and configuration."""
    
    def __init__(self):
        self.root_dir = Path(__file__).parent.parent
        self.monitoring_dir = self.root_dir / 'monitoring'
        self.grafana_dir = self.monitoring_dir / 'grafana'
        self.prometheus_dir = self.monitoring_dir / 'prometheus'
        self.scripts_dir = self.root_dir / 'scripts'
        self.docker_compose_file = self.root_dir / 'docker-compose.yml'
        
        # Ensure required directories exist
        self.grafana_dir.mkdir(parents=True, exist_ok=True)
        self.prometheus_dir.mkdir(parents=True, exist_ok=True)
    
    def check_docker(self) -> bool:
        """Check if Docker is installed and running."""
        try:
            result = subprocess.run(
                ["docker", "--version"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            return result.returncode == 0
        except FileNotFoundError:
            return False
    
    def check_docker_compose(self) -> bool:
        """Check if Docker Compose is available."""
        try:
            result = subprocess.run(
                ["docker-compose", "--version"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            return result.returncode == 0
        except FileNotFoundError:
            return False
    
    def generate_prometheus_config(self) -> None:
        """Generate Prometheus configuration file."""
        config = """global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'notefusion-backend'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['backend:8000']
    
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']
"""
        config_path = self.prometheus_dir / 'prometheus.yml'
        config_path.write_text(config)
        print(f"✅ Generated Prometheus config at {config_path}")
    
    def setup_grafana_provisioning(self) -> None:
        """Set up Grafana provisioning configuration."""
        # Create directories
        (self.grafana_dir / 'provisioning' / 'dashboards').mkdir(parents=True, exist_ok=True)
        (self.grafana_dir / 'provisioning' / 'datasources').mkdir(parents=True, exist_ok=True)
        (self.grafana_dir / 'provisioning' / 'alerting').mkdir(parents=True, exist_ok=True)
        
        # Create dashboard provisioning config
        dashboards_config = """apiVersion: 1

providers:
  - name: 'Notefusion'
    orgId: 1
    folder: 'Notefusion'
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /etc/grafana/provisioning/dashboards
"""
        (self.grafana_dir / 'provisioning' / 'dashboards' / 'dashboards.yml').write_text(dashboards_config)
        
        # Create datasource config
        datasource_config = """apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
"""
        (self.grafana_dir / 'provisioning' / 'datasources' / 'datasource.yml').write_text(datasource_config)
        
        print("✅ Set up Grafana provisioning configuration")
    
    def check_ports_available(self) -> bool:
        """Check if required ports are available."""
        ports = [3001, 9090, 9100, 8080, 9121, 9187]
        available = True
        
        for port in ports:
            if self.is_port_in_use(port):
                print(f"⚠️  Port {port} is already in use")
                available = False
        
        return available
    
    def is_port_in_use(self, port: int) -> bool:
        """Check if a port is in use."""
        import socket
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            return s.connect_ex(('localhost', port)) == 0
    
    def start_monitoring_services(self) -> bool:
        """Start the monitoring services using Docker Compose."""
        try:
            print("🚀 Starting monitoring services...")
            
            # Build and start the services
            cmd = [
                "docker-compose",
                "-f", str(self.docker_compose_file),
                "up", "-d",
                "prometheus", "grafana", "node-exporter",
                "cadvisor", "redis-exporter", "postgres-exporter"
            ]
            
            result = subprocess.run(
                cmd,
                cwd=str(self.root_dir),
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                print(f"❌ Failed to start monitoring services: {result.stderr}")
                return False
            
            print("✅ Monitoring services started successfully")
            print("\n📊 Access the monitoring tools at:")
            print("- Grafana: http://localhost:3001 (admin/admin123)")
            print("- Prometheus: http://localhost:9090")
            print("- cAdvisor: http://localhost:8080")
            
            return True
            
        except Exception as e:
            print(f"❌ Error starting monitoring services: {str(e)}")
            return False
    
    def setup_security_audit(self) -> None:
        """Set up scheduled security audits."""
        print("\n🔒 Setting up security audit...")
        
        # Install required Python packages
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "safety", "bandit"])
            print("✅ Installed security audit dependencies")
        except subprocess.CalledProcessError as e:
            print(f"⚠️  Failed to install security audit dependencies: {str(e)}")
        
        # Schedule the security audit on Windows
        if platform.system() == 'Windows':
            try:
                ps_script = self.scripts_dir / 'schedule_security_audit.ps1'
                subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-File", str(ps_script)], check=True)
                print("✅ Scheduled security audit with Windows Task Scheduler")
            except Exception as e:
                print(f"⚠️  Failed to schedule security audit: {str(e)}")
        else:
            print("ℹ️  Please schedule the security audit using cron or systemd")
    
    def run(self) -> bool:
        """Run the monitoring setup process."""
        print("🔍 NoteFusion AI - Monitoring Setup")
        print("=" * 50)
        
        # Check prerequisites
        print("\n🔧 Checking prerequisites...")
        if not self.check_docker():
            print("❌ Docker is not installed or not running")
            return False
        
        if not self.check_docker_compose():
            print("❌ Docker Compose is not installed")
            return False
        
        if not self.check_ports_available():
            print("\n⚠️  Some required ports are in use. Please stop the services using these ports or update the configuration.")
            return False
        
        # Generate configurations
        print("\n⚙️  Generating configurations...")
        self.generate_prometheus_config()
        self.setup_grafana_provisioning()
        
        # Start services
        print("\n🚀 Starting monitoring services...")
        if not self.start_monitoring_services():
            return False
        
        # Set up security audit
        self.setup_security_audit()
        
        print("\n✅ Monitoring setup completed successfully!")
        print("\nNext steps:")
        print("1. Access Grafana at http://localhost:3001 (admin/admin123)")
        print("2. Import dashboards from the monitoring/grafana/provisioning/dashboards/ directory")
        print("3. Set up alert notifications in Grafana")
        print("4. Review and update security configurations as needed")
        
        return True

def main() -> int:
    """Run the monitoring setup."""
    try:
        setup = MonitoringSetup()
        success = setup.run()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\nSetup cancelled by user.")
        return 1
    except Exception as e:
        print(f"\n❌ Error during setup: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
