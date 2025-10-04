# 🔐 Environment Variables Setup Guide

## Quick Start - Development Environment

### 1. Create `.env` file in backend directory

```bash
cd backend
cat > .env << 'EOF'
# ========================================
# JWT Configuration (REQUIRED)
# ========================================
JWT_SECRET=oOXH7vQaq4q4/6OcbveCevSVWCA+xvsKaSbkBWIQqNeir35tPF1R2yn1o/tsENeQtYy/9oFDJhRvEbVZxvdx8Q==

# ========================================
# Stripe Configuration (REQUIRED for payments)
# ========================================
# Get these from: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# ========================================
# OAuth2 Configuration (OPTIONAL)
# ========================================
# Google OAuth (optional - only if you want Google Sign-In)
# Get from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Microsoft OAuth (optional - only if you want Microsoft Sign-In)
# Get from: https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_TENANT_ID=common

# ========================================
# Database Configuration (OPTIONAL - defaults to H2)
# ========================================
# Uncomment these when using PostgreSQL
# DATABASE_URL=jdbc:postgresql://localhost:5432/asset_management
# DB_USERNAME=postgres
# DB_PASSWORD=your_db_password

# ========================================
# Email Configuration (OPTIONAL)
# ========================================
# Uncomment when you want to send emails
# EMAIL_NOTIFICATIONS_ENABLED=false
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USERNAME=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
# EMAIL_FROM=noreply@krubles.com
EOF
```

### 2. Load environment variables

**Option A: Manual (for current session)**
```bash
cd backend
export $(cat .env | grep -v '^#' | xargs)
```

**Option B: Add to your shell profile (persistent)**
```bash
# For zsh (macOS default)
echo 'export JWT_SECRET="oOXH7vQaq4q4/6OcbveCevSVWCA+xvsKaSbkBWIQqNeir35tPF1R2yn1o/tsENeQtYy/9oFDJhRvEbVZxvdx8Q=="' >> ~/.zshrc
source ~/.zshrc

# For bash
echo 'export JWT_SECRET="oOXH7vQaq4q4/6OcbveCevSVWCA+xvsKaSbkBWIQqNeir35tPF1R2yn1o/tsENeQtYy/9oFDJhRvEbVZxvdx8Q=="' >> ~/.bashrc
source ~/.bashrc
```

**Option C: Use direnv (recommended for multiple projects)**
```bash
# Install direnv
brew install direnv

# Add to shell (zsh)
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc
source ~/.zshrc

# Create .envrc file
cd backend
echo 'export $(cat .env | grep -v "^#" | xargs)' > .envrc
direnv allow

# Now direnv auto-loads when you cd into the directory!
```

### 3. Verify environment variables

```bash
# Check JWT_SECRET is set
echo $JWT_SECRET

# Should output: oOXH7vQaq4q4/6OcbveCevSVWCA+xvsKaSbkBWIQqNeir35tPF1R2yn1o/tsENeQtYy/9oFDJhRvEbVZxvdx8Q==
```

### 4. Start the application

```bash
cd backend
./mvnw spring-boot:run
```

You should see:
```
✅ JWT secret validated: length=88 characters
🚀 Asset Management System Started Successfully!
```

---

## Production Deployment

### AWS Deployment (Recommended)

#### Option 1: AWS Secrets Manager (Most Secure)

```bash
# Store JWT secret
aws secretsmanager create-secret \
  --name prod/asset-management/jwt-secret \
  --description "JWT signing secret for Asset Management System" \
  --secret-string "$(openssl rand -base64 64)"

# Store Stripe keys
aws secretsmanager create-secret \
  --name prod/asset-management/stripe-api-key \
  --secret-string "sk_live_YOUR_LIVE_KEY"

aws secretsmanager create-secret \
  --name prod/asset-management/stripe-publishable-key \
  --secret-string "pk_live_YOUR_LIVE_KEY"

# Retrieve in application
export JWT_SECRET=$(aws secretsmanager get-secret-value \
  --secret-id prod/asset-management/jwt-secret \
  --query SecretString \
  --output text)
```

#### Option 2: AWS Systems Manager Parameter Store

```bash
# Store secrets
aws ssm put-parameter \
  --name /prod/asset-management/jwt-secret \
  --value "$(openssl rand -base64 64)" \
  --type SecureString

# Retrieve
export JWT_SECRET=$(aws ssm get-parameter \
  --name /prod/asset-management/jwt-secret \
  --with-decryption \
  --query Parameter.Value \
  --output text)
```

#### Option 3: Environment Variables in Elastic Beanstalk

```bash
# Via EB CLI
eb setenv \
  JWT_SECRET="your-secret-here" \
  STRIPE_SECRET_KEY="sk_live_..." \
  STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Or via AWS Console:
# Elastic Beanstalk → Environment → Configuration → Software → Environment properties
```

### Docker Deployment

#### Using Environment File
```bash
# Create .env.production (NEVER commit this!)
cat > .env.production << EOF
JWT_SECRET=your-production-secret-here
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
EOF

# Run with env file
docker run --env-file .env.production -p 8080:8080 asset-management-backend:latest
```

#### Using Docker Secrets (Swarm/Kubernetes)
```bash
# Create secrets
echo "your-jwt-secret" | docker secret create jwt_secret -
echo "sk_live_..." | docker secret create stripe_api_key -

# docker-compose.yml
services:
  backend:
    image: asset-management-backend:latest
    secrets:
      - jwt_secret
      - stripe_api_key
    environment:
      JWT_SECRET_FILE: /run/secrets/jwt_secret
      STRIPE_SECRET_KEY_FILE: /run/secrets/stripe_api_key

secrets:
  jwt_secret:
    external: true
  stripe_api_key:
    external: true
```

### Kubernetes Deployment

```yaml
# Create secret
apiVersion: v1
kind: Secret
metadata:
  name: asset-management-secrets
  namespace: production
type: Opaque
stringData:
  jwt-secret: "oOXH7vQaq4q4/6OcbveCevSVWCA+xvsKaSbkBWIQqNeir35tPF1R2yn1o/tsENeQtYy/9oFDJhRvEbVZxvdx8Q=="
  stripe-api-key: "sk_live_YOUR_KEY"
  stripe-publishable-key: "pk_live_YOUR_KEY"

---
# Use in deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: asset-management-backend
spec:
  template:
    spec:
      containers:
      - name: backend
        image: asset-management-backend:latest
        env:
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: asset-management-secrets
              key: jwt-secret
        - name: STRIPE_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: asset-management-secrets
              key: stripe-api-key
```

Apply:
```bash
kubectl apply -f secrets.yaml
kubectl apply -f deployment.yaml
```

---

## Security Best Practices

### ✅ DO

1. **Use environment variables for all secrets** ✅
2. **Use different secrets per environment** (dev, staging, prod)
3. **Rotate secrets regularly** (quarterly recommended)
4. **Use managed secret services** (AWS Secrets Manager, Azure Key Vault)
5. **Limit secret access** with IAM roles
6. **Audit secret access** with CloudTrail/logs
7. **Use strong, random secrets** (64+ characters for JWT)

### ❌ DON'T

1. **Never commit secrets to Git** ❌
2. **Never use default/example secrets** ❌
3. **Never share secrets via email/Slack** ❌
4. **Never hardcode secrets in code** ❌
5. **Never reuse secrets across environments** ❌
6. **Never log secrets** ❌

---

## Generating Secure Secrets

### JWT Secret (256-bit minimum)
```bash
# Generate 512-bit secret (recommended)
openssl rand -base64 64

# Or using /dev/urandom
head -c 64 /dev/urandom | base64

# Or using Python
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

### API Keys
```bash
# Generate random API key
openssl rand -hex 32

# Or UUID-based
uuidgen | tr -d '-' | tr '[:upper:]' '[:lower:]'
```

---

## Troubleshooting

### Error: "JWT_SECRET environment variable is required"

**Solution:**
```bash
# Generate and export JWT_SECRET
export JWT_SECRET=$(openssl rand -base64 64)

# Verify it's set
echo $JWT_SECRET
```

### Error: "JWT_SECRET is too short"

**Solution:** Generate a longer secret (minimum 32 characters, recommended 64+)
```bash
export JWT_SECRET=$(openssl rand -base64 64)
```

### Error: "Application won't start in production"

**Check:**
1. All required environment variables are set
2. Secrets are loaded from vault/secrets manager
3. IAM roles have permission to access secrets
4. Database connection string is correct

```bash
# Debug: Print all environment variables (be careful not to log secrets!)
env | grep -E 'JWT|STRIPE|DATABASE' | sed 's/=.*/=***REDACTED***/'
```

### How to rotate secrets

**JWT Secret Rotation (Zero Downtime):**
```bash
# 1. Generate new secret
NEW_JWT_SECRET=$(openssl rand -base64 64)

# 2. Update secret in vault
aws secretsmanager update-secret \
  --secret-id prod/asset-management/jwt-secret \
  --secret-string "$NEW_JWT_SECRET"

# 3. Deploy new version with updated secret
# Blue-green deployment ensures no downtime

# 4. All existing JWTs become invalid (users must re-login)
# Consider implementing gradual rotation for critical apps
```

---

## CI/CD Integration

### GitHub Actions
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Get secrets from AWS
        run: |
          echo "JWT_SECRET=$(aws secretsmanager get-secret-value \
            --secret-id prod/asset-management/jwt-secret \
            --query SecretString --output text)" >> $GITHUB_ENV
      
      - name: Build and deploy
        run: |
          ./mvnw clean package
          # Deploy commands here
```

### GitLab CI
```yaml
deploy:
  stage: deploy
  script:
    - export JWT_SECRET=$(aws secretsmanager get-secret-value --secret-id prod/asset-management/jwt-secret --query SecretString --output text)
    - ./mvnw clean package
    - # Deploy commands
  only:
    - main
```

---

## Quick Reference

| Environment Variable | Required? | Purpose | Example |
|---------------------|-----------|---------|---------|
| `JWT_SECRET` | ✅ Yes | JWT signing key | `oOXH7vQa...` (64+ chars) |
| `STRIPE_SECRET_KEY` | For payments | Stripe API key | `sk_test_...` or `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY` | For payments | Stripe public key | `pk_test_...` or `pk_live_...` |
| `GOOGLE_CLIENT_ID` | For Google OAuth | Google OAuth ID | `*.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | For Google OAuth | Google secret | `GOCSPX-...` |
| `MICROSOFT_CLIENT_ID` | For MS OAuth | Azure AD app ID | `guid` |
| `MICROSOFT_CLIENT_SECRET` | For MS OAuth | Azure secret | `secret-value` |
| `DATABASE_URL` | For PostgreSQL | DB connection | `jdbc:postgresql://...` |

---

## Need Help?

- 📖 [Full Security Audit Report](./SECURITY-AUDIT-REPORT.md)
- 🚨 [Critical Security Fixes](./CRITICAL-SECURITY-FIXES.md)
- 📧 Contact: chase@example.com
