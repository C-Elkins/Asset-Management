# Contributing to Krubles Asset Management

Thank you for your interest in contributing to Krubles Asset Management! We welcome contributions from the community.

## 📜 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## 🤝 How to Contribute

We welcome contributions in many forms:

### 1. Bug Reports

Help us improve by reporting bugs! Before submitting:

- Check existing issues to avoid duplicates
- Use our bug report template
- Include clear reproduction steps
- Provide relevant logs and screenshots
- Specify your environment (OS, browser, versions)

**To report a bug:**
1. Go to [Issues](https://github.com/C-Elkins/IT-Asset-Management/issues)
2. Click "New Issue"
3. Select "Bug Report" template
4. Fill in all required fields

### 2. Security Vulnerabilities

**Do not report security issues publicly!** See our [Security Policy](./SECURITY.md) for responsible disclosure procedures.

**Security contact:** security@krubles.com

### 3. Feature Requests

We love hearing your ideas! When suggesting features:

- Explain the use case and problem it solves
- Provide examples or mockups if possible
- Consider how it fits with existing features
- Be open to discussion and alternative approaches

**To request a feature:**
1. Go to [Issues](https://github.com/C-Elkins/IT-Asset-Management/issues)
2. Click "New Issue"
3. Select "Feature Request" template
4. Describe your idea clearly

- Use our feature request template
- Explain the problem you're trying to solve
- Describe your proposed solution
- Consider potential alternatives

### 4. Documentation Improvements

Help make our docs better:

- Fix typos or clarify confusing sections
- Add examples or tutorials
- Improve API documentation
- Translate documentation (with prior approval)

### 5. Code Contributions

For code contributions (requires signed CLA):

- Bug fixes
- Performance improvements
- Test coverage improvements
- Code quality enhancements

**Note:** Feature implementations require prior approval from Krubles LLC maintainers.

## 📋 CLA Requirements

Before we can accept your contributions, you must sign our Contributor License Agreement (CLA). This protects both you and Krubles LLC by clarifying intellectual property rights.

### Individual CLA

If you're contributing as an individual, sign our Individual CLA by emailing contribute@krubles.com with:

```
Subject: Individual CLA Signature - [Your Name]

I, [Your Full Legal Name], agree to the terms of the Krubles LLC Individual 
Contributor License Agreement (v1.0) as published at 
https://krubles.com/legal/individual-cla

GitHub Username: [your-username]
Email: [your-email]
Date: [current-date]

Signature: [Your Full Name]
```

### Corporate CLA

If you're contributing on behalf of your employer, your organization must sign our Corporate CLA. Contact legal@krubles.com for the Corporate CLA form.

**Important:** We cannot merge any contributions until the CLA is signed and processed (typically 1-3 business days).

## 🐛 Bug Report Template

When reporting bugs, please use this template:

```markdown
**Bug Description**
[Clear, concise description of the bug]

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
[What you expected to happen]

**Actual Behavior**
[What actually happened]

**Screenshots**
[If applicable, add screenshots]

**Environment**
- OS: [e.g., Windows 11, macOS 13, Ubuntu 22.04]
- Browser: [e.g., Chrome 120, Firefox 121, Safari 17]
- Application Version: [e.g., 1.1.0]

**Additional Context**
[Any other relevant information]

**Logs**
```
[Paste relevant logs here]
```
```

## 💡 Feature Request Template

When requesting features, please use this template:

```markdown
**Feature Title**
[Clear, concise title]

**Problem Statement**
[Describe the problem this feature would solve]

**Proposed Solution**
[Describe your proposed solution]

**Alternative Solutions**
[Any alternative solutions you've considered]

**Benefits**
- [Benefit 1]
- [Benefit 2]

**Potential Drawbacks**
[Any potential downsides or concerns]

**Use Cases**
1. [Use case 1]
2. [Use case 2]

**Priority**
[Low / Medium / High / Critical]

**Willingness to Contribute**
[Are you willing to implement this feature? Note: Requires signed CLA]
```

## 🔧 Development Setup

### Prerequisites

- **Backend:** Java 17+ and Maven 3.8+
- **Frontend:** Node.js 20+
- **Database:** PostgreSQL 14+ (for local development)
- **Git:** Latest version

### Getting Started

1. **Clone the repository** (authorized contributors only):
   ```bash
   git clone https://github.com/krubles/asset-management-system.git
   cd asset-management-system
   ```

2. **Install dependencies:**
   
   Backend:
   ```bash
   cd backend
   ./mvnw install
   ```
   
   Frontend:
   ```bash
   cd frontend
   npm install
   ```

3. **Set up environment variables:**
   
   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

4. **Run the development servers:**
   
   Using VS Code tasks:
   - Open VS Code → Terminal → Run Task → "Start Backend & Frontend"
   
   Or manually:
   ```bash
   # Backend (terminal 1)
   cd backend
   ./mvnw spring-boot:run
   
   # Frontend (terminal 2)
   cd frontend
   npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080
   - API Documentation: http://localhost:8080/swagger-ui.html

## 📝 Code Standards

### Backend (Java)

- Follow **Google Java Style Guide**
- Use meaningful variable and method names
- Write Javadoc for public APIs
- Minimum 80% test coverage
- Use Spring Boot conventions and best practices
- Handle errors gracefully with proper exception handling

Example:
```java
/**
 * Retrieves an asset by its unique identifier.
 *
 * @param id the asset ID
 * @return the asset entity
 * @throws AssetNotFoundException if asset doesn't exist
 */
@GetMapping("/{id}")
public ResponseEntity<Asset> getAsset(@PathVariable Long id) {
    return ResponseEntity.ok(assetService.findById(id));
}
```

### Frontend (JavaScript/React)

- Follow **Airbnb JavaScript Style Guide**
- Use functional components with hooks
- Implement proper error boundaries
- Write unit tests for components
- Follow accessibility (a11y) best practices
- Use TypeScript when possible

Example:
```javascript
/**
 * Asset card component for displaying asset summary
 */
const AssetCard = ({ asset, onEdit, onDelete }) => {
  const handleEdit = useCallback(() => {
    onEdit(asset.id);
  }, [asset.id, onEdit]);

  return (
    <Card>
      <CardHeader>{asset.name}</CardHeader>
      <CardBody>{asset.description}</CardBody>
    </Card>
  );
};
```

### Commit Messages

Follow **Conventional Commits** specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(assets): add bulk import functionality

Implement CSV import for assets with validation and error handling.
Supports up to 10,000 assets per import.

Closes #123
```

```
fix(auth): resolve token expiration issue

Fixed bug where JWT tokens weren't properly refreshed, causing
unexpected logouts.

Fixes #456
```

## 🔀 Pull Request Process

### Before Submitting

1. **Sign the CLA** (if not already done)
2. **Create an issue** to discuss significant changes
3. **Ensure all tests pass** locally
4. **Update documentation** as needed
5. **Follow code standards** and conventions

### Submitting a PR

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** with clear, atomic commits

3. **Test thoroughly:**
   ```bash
   # Backend
   cd backend
   ./mvnw test
   
   # Frontend
   cd frontend
   npm test
   ```

4. **Push your branch:**
   ```bash
   git push origin feat/your-feature-name
   ```

5. **Open a Pull Request** with:
   - Clear title following conventional commits
   - Description of changes and motivation
   - Screenshots for UI changes
   - Link to related issue(s)
   - Confirmation that CLA is signed

### PR Template

```markdown
## Description
[Clear description of changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Closes #[issue-number]

## Checklist
- [ ] CLA signed
- [ ] Code follows project style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No new warnings or errors
- [ ] Commits are signed and follow conventional commits
- [ ] PR is small and focused (< 500 lines preferred)

## Screenshots (if applicable)
[Add screenshots here]

## Additional Notes
[Any additional context]
```

### Review Process

1. **Automated checks** run (tests, linting, security scans)
2. **Code review** by maintainers (typically 1-3 business days)
3. **Revisions** if requested
4. **Approval** by at least one maintainer
5. **Merge** by maintainer (squash and merge)

**Note:** Maintainers reserve the right to reject any PR that doesn't align with project goals or quality standards.

## 🧪 Testing Guidelines

### Backend Testing

- **Unit tests:** Test individual components in isolation
- **Integration tests:** Test component interactions
- **API tests:** Test REST endpoints
- **Minimum coverage:** 80%

Run tests:
```bash
cd backend
./mvnw test                    # Run all tests
./mvnw test -Dtest=AssetTest   # Run specific test
./mvnw verify                  # Run tests + integration tests
```

### Frontend Testing

- **Component tests:** Test React components
- **Hook tests:** Test custom hooks
- **Integration tests:** Test user flows
- **Accessibility tests:** Ensure WCAG 2.1 AA compliance

Run tests:
```bash
cd frontend
npm test              # Run all tests
npm test -- --watch   # Run in watch mode
npm run test:coverage # Run with coverage report
```

## 📚 Documentation Contributions

We welcome documentation improvements! You can contribute to:

- **User Guide** (`docs/user-guide.md`) - End-user documentation
- **API Documentation** (`docs/api-documentation.md`) - REST API reference
- **Deployment Guide** (`docs/deployment-guide.md`) - Installation and configuration
- **README** - Project overview and quick start

Documentation standards:
- Use clear, concise language
- Include code examples where helpful
- Add screenshots for UI documentation
- Keep formatting consistent
- Test all code examples

## 🏆 Recognition

We value our contributors! When your contribution is accepted:

- ✅ You'll be acknowledged in release notes
- ✅ Your name added to `CONTRIBUTORS.md`
- ✅ Potential for swag (stickers, t-shirts) for significant contributions
- ✅ References available upon request
- ✅ Consideration for job opportunities at Krubles LLC

## 📞 Community Guidelines

When participating in our community:

- ✅ **Be respectful** and inclusive
- ✅ **Be constructive** in feedback
- ✅ **Be professional** in all interactions
- ✅ **Be patient** with maintainers and other contributors
- ❌ **Don't** share proprietary information
- ❌ **Don't** violate our [Code of Conduct](./CODE_OF_CONDUCT.md)

## 📧 Contact

- **General questions:** support@krubles.com
- **Security issues:** security@krubles.com
- **Legal/CLA questions:** legal@krubles.com
- **Code of Conduct concerns:** conduct@krubles.com
- **Contribution process:** contribute@krubles.com

## ⚖️ License

This project is proprietary software owned by Krubles LLC. See [LICENSE](./LICENSE) for details.

**By contributing, you acknowledge that:**

1. You have read and agree to our [LICENSE](./LICENSE)
2. You have read and agree to our [Code of Conduct](./CODE_OF_CONDUCT.md)
3. You have signed or will sign our Contributor License Agreement
4. You understand that all contributions become the property of Krubles LLC
5. You waive all rights to your contributions, including moral rights and attribution

---

## 📋 Contribution Checklist

Before making your first contribution, ensure you've:

- [ ] Read and understood the [LICENSE](./LICENSE)
- [ ] Read and agreed to the [Code of Conduct](./CODE_OF_CONDUCT.md)
- [ ] Signed the appropriate CLA (Individual or Corporate)
- [ ] Set up your development environment
- [ ] Reviewed our code standards and guidelines
- [ ] Understood our PR process
- [ ] Acknowledged that all contributions become Krubles LLC property

---

## ⚠️ Important Reminders

1. **All contributions become Krubles LLC property** - You assign all rights to Krubles LLC
2. **No forking for derivative works** - Only fork for bug reports or approved contributions
3. **Commercial use prohibited** - Requires separate commercial license
4. **Confidentiality required** - Do not share proprietary information
5. **CLA required** - Must be signed before first contribution

**Violations of these terms may result in:**
- Removal of contribution access
- Legal action to protect Krubles LLC intellectual property
- Reporting to GitHub and law enforcement if applicable

---

**Thank you for contributing to Asset Management System by Krubles™!**

For the latest version of this guide, visit: https://github.com/krubles/asset-management-system/blob/main/CONTRIBUTING.md

*Last Updated: October 2, 2025*
*Version: 2.0*
