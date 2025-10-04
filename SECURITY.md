# Security Policy

**Asset Management System by Krubles LLC**  
Protecting Your Data and Infrastructure

---

## Our Commitment to Security

At **Krubles LLC**, security is our top priority. We are committed to protecting the integrity, confidentiality, and availability of the Asset Management System and the data it manages. We take all security concerns seriously and appreciate the security community's efforts to responsibly disclose vulnerabilities.

---

## Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          | Status                    |
| ------- | ------------------ | ------------------------- |
| 1.1.x   | ✅ Yes             | Current Release           |
| 1.0.x   | ✅ Yes             | Security Updates Only     |
| < 1.0   | ❌ No              | End of Life               |

**Recommendation**: Always use the latest version to ensure you have the most recent security patches and features.

---

## Reporting a Vulnerability

### 🔒 Responsible Disclosure

If you discover a security vulnerability in the Asset Management System, please report it to us responsibly. We are committed to working with security researchers and the community to verify and address security issues quickly.

### How to Report

**Primary Contact:**
- **Email**: security@krubles.com
- **Subject**: [SECURITY] Brief description of the vulnerability
- **GitHub**: Private security advisory (preferred for code-related issues)

**For Critical Issues:**
- Email security@krubles.com immediately with "CRITICAL" in the subject line
- Include your contact information for expedited communication

### What to Include in Your Report

To help us understand and address the issue quickly, please include:

1. **Description**: Clear description of the vulnerability
2. **Impact**: Potential impact and severity assessment
3. **Steps to Reproduce**: Detailed steps to reproduce the issue
4. **Proof of Concept**: Code, screenshots, or demonstration (if applicable)
5. **Affected Versions**: Which versions are impacted
6. **Suggested Fix**: Recommendations for remediation (optional)
7. **Discoverer Info**: Your name/handle for acknowledgment (optional)

### Example Report Format

```
Subject: [SECURITY] SQL Injection in Asset Search

Vulnerability Type: SQL Injection
Severity: High
Affected Component: Asset Search API
Affected Versions: 1.0.x - 1.1.0

Description:
The asset search endpoint is vulnerable to SQL injection through the 
'category' parameter, allowing unauthorized database access.

Steps to Reproduce:
1. Navigate to /api/assets/search
2. Submit: category=' OR '1'='1
3. Observe: All assets returned regardless of permissions

Impact:
Attackers could potentially read, modify, or delete asset data, bypass 
authentication, or access sensitive information.

Proof of Concept:
curl -X GET "https://example.com/api/assets/search?category=' OR '1'='1"

Suggested Fix:
Implement parameterized queries and input validation for the category parameter.

Discoverer: [Your Name/Handle]
Contact: researcher@example.com
```

---

## Response Process

### Our Commitment

When you report a vulnerability, we commit to:

1. **Acknowledge Receipt**: Within 48 hours (business days)
2. **Initial Assessment**: Within 5 business days
3. **Regular Updates**: Every 7 days until resolved
4. **Coordinated Disclosure**: Work with you on timing
5. **Recognition**: Credit you in security advisories (if desired)

### Timeline

- **Critical Vulnerabilities**: Fix within 7 days
- **High Severity**: Fix within 30 days
- **Medium Severity**: Fix within 60 days
- **Low Severity**: Fix within 90 days

Timelines may vary based on complexity and require coordination for breaking changes.

### What Happens Next

1. **Verification**: We verify and reproduce the vulnerability
2. **Assessment**: We assess severity using CVSS 3.1 scoring
3. **Development**: We develop and test a fix
4. **Release**: We prepare a security update
5. **Disclosure**: We coordinate public disclosure
6. **Credit**: We acknowledge reporters (unless anonymity requested)

---

## Security Update Distribution

### Notification Channels

Security updates are distributed through:

- **GitHub Security Advisories**: Primary notification method
- **Release Notes**: Documented in RELEASE_NOTES.md
- **Email**: Sent to registered users (enterprise licenses)
- **Website**: Posted at https://krubles.com/security
- **Social Media**: Announced on official Krubles channels

### Update Procedure

1. Review the security advisory
2. Assess impact on your deployment
3. Test the update in a staging environment
4. Apply the update to production
5. Verify the fix resolves the issue
6. Monitor for any unexpected behavior

---

## Security Best Practices

### For Deployment

- ✅ Always use HTTPS/TLS for all communications
- ✅ Keep the application and dependencies up to date
- ✅ Use strong, unique passwords and enable MFA
- ✅ Implement proper firewall rules and network segmentation
- ✅ Regular backup and test restore procedures
- ✅ Monitor logs for suspicious activity
- ✅ Use OAuth 2.0 for authentication when possible
- ✅ Implement rate limiting and API throttling
- ✅ Follow the principle of least privilege for access control
- ✅ Regularly review and audit user permissions

### For Development

- ✅ Follow secure coding practices
- ✅ Validate and sanitize all inputs
- ✅ Use parameterized queries for database access
- ✅ Implement proper error handling (don't expose sensitive info)
- ✅ Conduct code reviews with security focus
- ✅ Run static analysis and dependency scanning
- ✅ Test with security testing tools (SAST/DAST)
- ✅ Document security assumptions and requirements

---

## Vulnerability Disclosure Policy

### Public Disclosure

We believe in transparent communication about security issues while protecting our users:

- **Coordinated Disclosure**: We prefer coordinated disclosure with a 90-day window
- **Early Disclosure**: We may disclose earlier if actively exploited or patch is available
- **Delayed Disclosure**: We may delay if fix requires significant architectural changes
- **Credit**: We acknowledge security researchers in advisories (unless anonymity requested)

### Embargo Period

We request a **90-day embargo** from initial report to allow:

- Verification and assessment
- Development and testing of fixes
- Coordination with dependent projects
- Preparation of security advisories
- Distribution of patches to users

---

## What NOT to Do

### Prohibited Activities

To maintain a safe and legal research environment, please:

❌ **DO NOT** publicly disclose the vulnerability before we've addressed it  
❌ **DO NOT** exploit the vulnerability beyond proof of concept  
❌ **DO NOT** access, modify, or delete other users' data  
❌ **DO NOT** perform denial of service attacks  
❌ **DO NOT** conduct social engineering attacks against Krubles staff  
❌ **DO NOT** violate privacy laws or access restricted data  
❌ **DO NOT** use automated scanners without permission  
❌ **DO NOT** violate our license terms or steal intellectual property  

### Safe Harbor

Krubles LLC commits to not pursue legal action against security researchers who:

- Report vulnerabilities in good faith
- Follow this responsible disclosure policy
- Make a reasonable effort to avoid harm
- Do not violate privacy or laws
- Do not access data beyond what's necessary to demonstrate the vulnerability

---

## Security Features

### Built-in Security

The Asset Management System includes:

- 🔐 **Authentication**: JWT, OAuth 2.0 (Google, Microsoft), MFA
- 🔑 **Authorization**: Role-based access control (RBAC)
- 🛡️ **API Security**: Rate limiting, API keys, request validation
- 📝 **Audit Logging**: Comprehensive activity tracking
- 🔒 **Data Protection**: Encryption at rest and in transit
- 🚨 **Security Headers**: HSTS, CSP, X-Frame-Options, etc.
- 🧪 **Input Validation**: Server-side validation for all inputs
- 🗝️ **Password Security**: Bcrypt hashing with appropriate work factors
- 📧 **Email Security**: DKIM, SPF configuration support
- 🔍 **Dependency Scanning**: Regular CVE monitoring

---

## Security Resources

### Documentation

- [Authentication Setup Guide](docs/auth-setup.md)
- [API Security Documentation](docs/api-documentation.md)
- [Deployment Guide](docs/deployment-guide.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [License Terms](LICENSE)

### External Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [CVSS Calculator](https://www.first.org/cvss/calculator/3.1)
- [Security Advisories](https://github.com/C-Elkins/IT-Asset-Management/security/advisories)

---

## Recognition Program

### Hall of Fame

We maintain a [Security Researchers Hall of Fame](SECURITY_HALL_OF_FAME.md) to acknowledge contributors who have helped improve our security posture.

### Rewards

While we don't currently offer a bug bounty program, we do provide:

- Public acknowledgment in security advisories
- Listed in our Hall of Fame
- Krubles swag and merchandise
- Professional references for career development
- Priority consideration for job opportunities

---

## Compliance and Certifications

Krubles LLC is committed to meeting industry security standards:

- **OWASP**: Following OWASP Top 10 guidelines
- **CWE**: Addressing Common Weakness Enumeration
- **GDPR**: Privacy-conscious data handling
- **SOC 2** (planned): Security audit compliance
- **ISO 27001** (planned): Information security management

---

## Contact Information

### Security Team

- **Email**: security@krubles.com
- **PGP Key**: Available at https://krubles.com/security/pgp-key.asc
- **Response Time**: 48 hours (business days)

### Other Contacts

- **General Support**: support@krubles.com
- **Legal/Compliance**: legal@krubles.com
- **Privacy Concerns**: privacy@krubles.com
- **Conduct Violations**: conduct@krubles.com

### Company Information

**Krubles LLC**  
Website: https://krubles.com  
GitHub: https://github.com/C-Elkins/IT-Asset-Management  
LinkedIn: https://linkedin.com/company/krubles

---

## Updates to This Policy

This security policy may be updated periodically. Check back regularly for changes.

**Last Updated**: October 2, 2025  
**Version**: 2.0

---

**Thank you for helping keep the Asset Management System and our users safe!**

We appreciate the security community's efforts in responsible disclosure and look forward to working with you to protect our users and their data.

---

© 2024-2025 Krubles LLC. All Rights Reserved.  
Asset Management System by Krubles™
