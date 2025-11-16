# NoteFusion AI - Monitoring and Security Setup

This document provides an overview of the monitoring and security setup for the NoteFusion AI application.

## Monitoring Stack

The application uses the following monitoring tools:

- **Prometheus** - Metrics collection and alerting
- **Grafana** - Visualization and dashboards
- **Node Exporter** - Host-level metrics
- **cAdvisor** - Container metrics
- **Redis Exporter** - Redis metrics
- **Postgres Exporter** - PostgreSQL metrics

## Accessing Monitoring Tools

### Grafana
- **URL**: http://localhost:3001
- **Default Credentials**:
  - Username: `admin` (or set via `GRAFANA_ADMIN_USER`)
  - Password: `admin123` (or set via `GRAFANA_ADMIN_PASSWORD`)

### Prometheus
- **URL**: http://localhost:9090

### cAdvisor
- **URL**: http://localhost:8080

### Node Exporter
- **Metrics Endpoint**: http://localhost:9100/metrics

## Security Procedures

### Key Rotation

To rotate all API keys and secrets:

```bash
python scripts/rotate_api_keys.py
```

This will:
1. Generate new secure keys for all services
2. Update the `.env` file
3. Display the new keys (save them securely)

### Environment Validation

To validate environment variables:

```bash
python scripts/validate_environment.py
```

### Security Configuration Update

To update security configurations:

```bash
python scripts/update_security_config.py
```

## Alerting

Alerts are configured in `monitoring/grafana/provisioning/alerting/alert-rules.yml` and include:

- High error rates
- High latency
- Resource usage (CPU, memory, disk)
- Service availability
- Authentication failures
- Rate limiting

## Regular Security Audits

1. **Monthly Security Scans**
   - Run dependency scans: `safety check -r requirements-updated.txt`
   - Check for outdated packages: `pip list --outdated`

2. **Quarterly Security Review**
   - Review access controls
   - Audit user permissions
   - Review security logs

3. **Annual Penetration Testing**
   - Schedule external security audit
   - Review and update security policies

## Backup Procedures

### Database Backups

```bash
# Create a backup
docker exec -t notefusion-db pg_dump -U notefusion -d notefusion > backup_$(date +%Y-%m-%d).sql

# Restore from backup
cat backup_2023-01-01.sql | docker exec -i notefusion-db psql -U notefusion -d notefusion
```

### Redis Data Backup

```bash
# Create a backup
docker exec -t notefusion-redis redis-cli SAVE
```

## Incident Response

1. **Detection**
   - Monitor alerts in Grafana
   - Review application logs

2. **Containment**
   - Isolate affected systems if necessary
   - Preserve evidence

3. **Eradication**
   - Identify and fix the root cause
   - Rotate compromised credentials

4. **Recovery**
   - Restore from clean backups if needed
   - Verify system integrity

5. **Post-Incident Review**
   - Document the incident
   - Update security measures
   - Train staff if needed

## Maintenance Schedule

- **Daily**: Check alerts and system health
- **Weekly**: Review logs and metrics
- **Monthly**: Apply security updates
- **Quarterly**: Security review and audit
- **Annually**: Full security assessment
