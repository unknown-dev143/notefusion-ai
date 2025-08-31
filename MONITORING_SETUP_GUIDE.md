# NoteFusion AI - Monitoring Setup Guide

## Prerequisites
- Docker Desktop installed and running
- At least 2GB of free memory
- Ports 3001, 9090, and 8080 available

## Quick Start

1. **Start the monitoring services**:
   ```bash
   docker-compose up -d prometheus grafana node-exporter cadvisor redis-exporter postgres-exporter
   ```

2. **Access the monitoring tools**:
   - Grafana: http://localhost:3001 (admin/admin123)
   - Prometheus: http://localhost:9090
   - cAdvisor: http://localhost:8080

3. **Import Grafana dashboards**:
   - Log in to Grafana
   - Go to **Dashboards > Import**
   - Upload: `monitoring/grafana/provisioning/dashboards/notefusion-dashboard.json`

## Detailed Setup

### 1. Docker Desktop Installation
1. Download from: https://www.docker.com/products/docker-desktop/
2. Run the installer with default settings
3. Launch Docker Desktop from the Start menu

### 2. Starting Services
Run this command in your project root:
```bash
docker-compose up -d prometheus grafana node-exporter cadvisor redis-exporter postgres-exporter
```

### 3. Verifying Services
Check if all services are running:
```bash
docker ps
```

### 4. Accessing Monitoring Tools
- **Grafana**: http://localhost:3001
  - Default credentials: admin/admin123
- **Prometheus**: http://localhost:9090
- **cAdvisor**: http://localhost:8080

## Security Recommendations

1. **Change Default Credentials**
   - Change the default Grafana admin password
   - Update Prometheus basic auth if configured

2. **Enable HTTPS**
   - Configure reverse proxy with SSL termination
   - Use Let's Encrypt for free SSL certificates

3. **Network Security**
   - Restrict access to monitoring endpoints
   - Use VPN for remote access
   - Configure firewall rules

## Troubleshooting

### Common Issues
1. **Port Conflicts**
   - Ensure ports 3001, 9090, and 8080 are not in use
   - Check with: `netstat -ano | findstr :<port>`

2. **Docker Not Starting**
   - Restart Docker Desktop
   - Check system requirements
   - Ensure virtualization is enabled in BIOS

3. **Service Not Accessible**
   - Check service logs: `docker-compose logs <service_name>`
   - Verify container status: `docker ps -a`

## Maintenance

### Backing Up Data
```bash
# Backup Prometheus data
docker cp notefusion-prometheus:/prometheus ./backup/prometheus

# Backup Grafana data
docker cp notefusion-grafana:/var/lib/grafana ./backup/grafana
```

### Updating Services
1. Pull latest images:
   ```bash
   docker-compose pull
   ```
2. Recreate containers:
   ```bash
   docker-compose up -d
   ```

## Support
For additional help, please refer to:
- [Grafana Documentation](https://grafana.com/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Docker Documentation](https://docs.docker.com/)

---
*Last Updated: 2025-08-30*
