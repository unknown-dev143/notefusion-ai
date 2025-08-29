# NoteFusion AI Deployment Checklist

## Pre-Deployment

### Server Setup
- [ ] Set up Ubuntu 22.04 server
- [ ] Configure SSH access
- [ ] Set up domain name (A record pointing to server IP)
- [ ] Run `setup_server.sh` as root

### Application Setup
- [ ] Clone repository to `/var/www/notefusion`
- [ ] Set up Python virtual environment
- [ ] Install backend dependencies
- [ ] Install frontend dependencies
- [ ] Build frontend assets

### Database Setup
- [ ] Create PostgreSQL database
- [ ] Run database migrations
- [ ] Seed initial data (if needed)

## Deployment

### Backend
- [ ] Copy `.env.production` to `.env`
- [ ] Configure environment variables
- [ ] Set up systemd service
- [ ] Start backend service

### Frontend
- [ ] Build production assets
- [ ] Configure Nginx
- [ ] Set up SSL with Let's Encrypt
- [ ] Restart Nginx

## Post-Deployment

### Verification
- [ ] Test API endpoints
- [ ] Test frontend functionality
- [ ] Verify file uploads
- [ ] Check error logs

### Monitoring
- [ ] Set up log rotation
- [ ] Configure monitoring (optional)
- [ ] Set up backups
- [ ] Configure firewall rules

## Maintenance
- [ ] Schedule regular backups
- [ ] Set up log rotation
- [ ] Configure auto-updates
- [ ] Document deployment process

## Troubleshooting

### Common Issues
1. **Database connection errors**
   - Check PostgreSQL is running
   - Verify credentials in `.env`
   - Check connection settings in `database.py`

2. **Static files not loading**
   - Check Nginx configuration
   - Verify file permissions
   - Check Nginx error logs

3. **SSL certificate issues**
   - Check domain configuration
   - Verify port 443 is open
   - Check Certbot logs

### Log Locations
- Backend logs: `/var/log/notefusion/`
- Nginx access logs: `/var/log/nginx/notefusion.access.log`
- Nginx error logs: `/var/log/nginx/notefusion.error.log`
- System logs: `journalctl -u notefusion.service`

## Rollback Plan
1. Stop the service: `systemctl stop notefusion`
2. Restore database from backup
3. Revert code to previous version
4. Restart services

## Emergency Contacts
- Server Admin: [Your Contact]
- Database Admin: [Your Contact]
- Development Team: [Your Contact]
