# Email Notifications Integration

## Overview
Email Notifications automatically sends alerts and reminders to users about important asset events. The system supports HTML-formatted emails with branded templates matching the Krubles blue-green theme.

## Features

### Automated Notifications
- **Asset Assignment**: Notify users when assets are assigned to them
- **Welcome Emails**: Send onboarding emails to new users
- **Maintenance Reminders**: Daily digest of assets needing maintenance (within 30 days)
- **Warranty Expiration Alerts**: Daily digest of warranties expiring soon (within 30 days)
- **Maintenance Completion**: Notify when maintenance is completed

### Email Design
- Beautiful HTML templates with Krubles branding
- Blue-green gradient headers (#2563eb to #10b981)
- Responsive design for mobile and desktop
- Professional formatting with asset details
- Direct links to assets in the dashboard

### Scheduled Tasks
- **Maintenance Check**: Runs daily at 8:00 AM
- **Warranty Check**: Runs daily at 8:30 AM
- Sends digest emails to admins and assigned users
- Customizable schedule via configuration

## Configuration

### Environment Variables

```bash
# Enable email notifications
EMAIL_NOTIFICATIONS_ENABLED=true

# Sender address
EMAIL_FROM=noreply@krubles.com

# SMTP Configuration
SMTP_HOST=smtp.gmail.com          # e.g., smtp.gmail.com, smtp.sendgrid.net
SMTP_PORT=587                     # Usually 587 for TLS
SMTP_USERNAME=your-email@domain.com
SMTP_PASSWORD=your-app-password

# Frontend URL (for email links)
APP_URL=https://yourdomain.com
```

### SMTP Providers

#### Gmail
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Not your Gmail password! Use App Password
```
**Setup**: Enable 2FA in Gmail, then create an App Password at https://myaccount.google.com/apppasswords

#### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey              # Literally "apikey"
SMTP_PASSWORD=your-sendgrid-api-key
```

#### AWS SES
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USERNAME=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
```

#### Mailgun
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USERNAME=postmaster@yourdomain.com
SMTP_PASSWORD=your-mailgun-password
```

### Application Configuration

The system uses Spring Boot's mail configuration. You can customize schedules in `application.yml`:

```yaml
email:
  notifications:
    enabled: true
  from: noreply@krubles.com

spring.mail:
  host: smtp.gmail.com
  port: 587
  username: your-email@gmail.com
  password: your-app-password
  properties:
    mail.smtp:
      auth: true
      starttls.enable: true
      starttls.required: true

scheduling:
  maintenance-check:
    cron: "0 0 8 * * *"    # 8:00 AM daily
  warranty-check:
    cron: "0 30 8 * * *"   # 8:30 AM daily
```

## API Endpoints

### Check Email Status
```bash
GET /api/v1/emails/status
```
**Response:**
```json
{
  "configured": true,
  "enabled": true,
  "message": "Email notifications are enabled"
}
```

### Send Test Email (Admin Only)
```bash
POST /api/v1/emails/test
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "to": "test@example.com"
}
```

**Response:**
```json
{
  "message": "Test email sent successfully to test@example.com",
  "status": "success"
}
```

### Send Custom Email (Admin Only)
```bash
POST /api/v1/emails/send
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Custom Subject",
  "body": "<h1>Hello!</h1><p>Custom HTML body</p>"
}
```

## Email Templates

All emails use a consistent branded template with:

1. **Header**: Krubles logo with blue-green gradient
2. **Title**: Bold title describing the notification type
3. **Content**: Personalized message with asset details
4. **Call-to-Action**: Button linking to the relevant dashboard page
5. **Footer**: Support contact information

### Asset Details Card
Each email includes a beautifully formatted card with:
- Asset name
- Asset tag
- Serial number
- Location
- Status

### Color Scheme
- Primary gradient: Blue (#2563eb) to Green (#10b981)
- Background: White with subtle blue-green gradient accents
- Text: Dark gray (#1f2937) for headings, medium gray (#4b5563) for body
- Links: Blue (#2563eb)

## Event Triggers

### User Registration
- **Trigger**: New user account created
- **Recipient**: New user
- **Content**: Welcome message with dashboard link

### Asset Assignment
- **Trigger**: Asset assigned to user
- **Recipient**: Assigned user
- **Content**: Asset details and direct link

### Maintenance Scheduled
- **Trigger**: Manual trigger (future enhancement)
- **Recipient**: Assigned users and admins
- **Content**: Maintenance date and asset details

### Maintenance Completed
- **Trigger**: Manual trigger (future enhancement)
- **Recipient**: Assigned users and admins
- **Content**: Confirmation of completion

### Daily Maintenance Digest (8:00 AM)
- **Trigger**: Scheduled task
- **Recipients**: 
  - Admins (all assets needing maintenance)
  - Assigned users (their assets only)
- **Content**: List of assets with maintenance due within 30 days

### Daily Warranty Digest (8:30 AM)
- **Trigger**: Scheduled task
- **Recipients**: 
  - Admins (all expiring warranties)
  - Assigned users (their assets only)
- **Content**: List of assets with warranties expiring within 30 days

## Testing

### 1. Check Configuration Status
```bash
curl -X GET http://localhost:8080/api/v1/emails/status
```

### 2. Send Test Email
```bash
curl -X POST http://localhost:8080/api/v1/emails/test \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

### 3. Create Test User (Triggers Welcome Email)
```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "role": "USER"
  }'
```

### 4. Assign Asset (Triggers Assignment Email)
```bash
curl -X POST http://localhost:8080/api/v1/assets/{assetId}/assign/{userId} \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 5. Manually Trigger Scheduled Tasks
You can add an admin endpoint to manually trigger the scheduled checks for testing:

```java
// Add to EmailController or create ScheduledTaskController
@PostMapping("/scheduled/maintenance-check")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public ResponseEntity<String> triggerMaintenanceCheck() {
    scheduledTaskService.triggerMaintenanceCheck();
    return ResponseEntity.ok("Maintenance check triggered");
}

@PostMapping("/scheduled/warranty-check")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public ResponseEntity<String> triggerWarrantyCheck() {
    scheduledTaskService.triggerWarrantyCheck();
    return ResponseEntity.ok("Warranty check triggered");
}
```

## Troubleshooting

### Emails Not Sending

1. **Check configuration status**:
   ```bash
   curl http://localhost:8080/api/v1/emails/status
   ```

2. **Verify environment variables**:
   ```bash
   echo $EMAIL_NOTIFICATIONS_ENABLED
   echo $SMTP_HOST
   ```

3. **Check application logs**:
   ```bash
   grep -i "email" backend/logs/application.json
   ```

### SMTP Authentication Errors

- **Gmail**: Make sure you're using an App Password, not your regular password
- **SendGrid**: Username must be literally "apikey"
- **AWS SES**: Verify your sending domain/email in SES console
- **Port**: Usually 587 for TLS, 465 for SSL

### Emails Going to Spam

1. **Set up SPF record**: Add to DNS
   ```
   v=spf1 include:_spf.google.com ~all
   ```

2. **Set up DKIM**: Configure in your email provider

3. **Use a proper FROM address**: Not `noreply@localhost`

4. **Test with mail-tester.com**: Send test email to check spam score

### Schedule Not Running

1. **Verify scheduling is enabled**:
   - Check `@EnableScheduling` in `AssetManagementApplication.java`
   - Check `@EnableAsync` for async email sending

2. **Check cron expression**:
   ```yaml
   scheduling:
     maintenance-check:
       cron: "0 0 8 * * *"  # Second, Minute, Hour, Day, Month, Weekday
   ```

3. **Check timezone**: Scheduled tasks run in server timezone

## Security Best Practices

1. **Never commit SMTP credentials**: Use environment variables
2. **Use App Passwords**: Don't use main account passwords
3. **Enable TLS**: Always use `starttls.enable: true`
4. **Validate email addresses**: Service validates before sending
5. **Rate limiting**: Consider adding rate limits to prevent abuse
6. **Async sending**: Emails send asynchronously to not block requests

## Performance Considerations

- **Async Processing**: All emails send via `@Async` to prevent blocking
- **Batch Digests**: Daily digests instead of individual emails for maintenance/warranty
- **Connection Pooling**: SMTP connections are managed by Spring
- **Timeout Settings**: 5 second timeouts prevent hanging
- **Graceful Failures**: Email failures are logged but don't crash the system

## Future Enhancements

- [ ] Email templates customization UI
- [ ] User email preferences (frequency, types)
- [ ] Email delivery status tracking
- [ ] Retry logic for failed sends
- [ ] Email analytics dashboard
- [ ] Support for email attachments (reports)
- [ ] Multi-language email templates
- [ ] Email preview before sending

## Integration Count

With Email Notifications, Krubles now has **8 live integrations**:
1. REST API
2. CSV Import/Export
3. Excel Import/Export
4. Webhooks
5. Slack Notifications
6. Email Notifications ← NEW!
7. Enhanced Filtered Exports
8. OpenAPI Documentation

**Next up**: API Rate Limiting & API Keys 🚀
