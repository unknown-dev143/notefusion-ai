# NoteFusion AI - Monitoring Setup

This directory contains the configuration files for the NoteFusion AI monitoring stack, which includes:

- **Prometheus** - Metrics collection and alerting
- **Grafana** - Visualization and dashboards
- **Node Exporter** - Host metrics
- **cAdvisor** - Container metrics
- **Redis Exporter** - Redis metrics
- **Postgres Exporter** - PostgreSQL metrics

## Prerequisites

- Docker and Docker Compose
- At least 2GB of free memory
- Ports 9090, 3001, 9100, 8080, 9121, 9187 available

## Getting Started

1. **Start the monitoring stack**:
   ```bash
   docker-compose -f ../docker-compose.yml up -d prometheus grafana node-exporter cadvisor redis-exporter postgres-exporter
   ```

2. **Access the dashboards**:
   - Grafana: http://localhost:3001
     - Default credentials: admin/admin123
   - Prometheus: http://localhost:9090
   - cAdvisor: http://localhost:8080

3. **Import dashboards in Grafana**:
   - Go to http://localhost:3001
   - Log in with admin/admin123
   - Navigate to Dashboards > Import
   - Upload the JSON files from `grafana/provisioning/dashboards/`

## Security Considerations

- Change the default Grafana admin password
- Configure HTTPS for production use
- Set up authentication for Prometheus and Grafana
- Restrict access to monitoring endpoints using a reverse proxy

## Alerting

Alert rules are defined in `grafana/provisioning/alerting/alert-rules.yml`. These include:

- High error rates
- High latency
- Resource usage (CPU, memory, disk)
- Service availability
- Authentication failures
- Rate limiting

## Maintenance

### Updating Dashboards
1. Make changes in the Grafana UI
2. Export the dashboard as JSON
3. Save it to `grafana/provisioning/dashboards/`

### Backing Up Data
```bash
# Backup Prometheus data
docker cp notefusion-prometheus:/prometheus ./backup/prometheus

# Backup Grafana data
docker cp notefusion-grafana:/var/lib/grafana ./backup/grafana
```

### Restoring Data
```bash
# Restore Prometheus data
docker cp ./backup/prometheus notefusion-prometheus:/prometheus

# Restore Grafana data
docker cp ./backup/grafana notefusion-grafana:/var/lib/grafana
```

## Troubleshooting

### Check Container Logs
```bash
docker-compose logs -f [service_name]
```

### Check Prometheus Targets
1. Go to http://localhost:9090/targets
2. Verify all targets are up

### Check Grafana Data Sources
1. Go to http://localhost:3001/datasources
2. Verify Prometheus data source is working

## License

This monitoring setup is part of the NoteFusion AI application. See the main project repository for license information.
