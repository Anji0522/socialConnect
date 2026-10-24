# Contributing to SocialConnect

Thank you for your interest in contributing to **SocialConnect**! We welcome bug reports, feature requests, and pull requests from everyone.

---

## 🛠️ Code of Conduct & Development Workflow

### 1. Fork & Branch
- Fork the repository and create a new feature branch from `main`:
  ```bash
  git checkout -b feat/your-feature-name
  ```

### 2. Environment Setup
- Install dependencies:
  ```bash
  npm install
  ```
- Copy the environment templates:
  ```bash
  cp .env.example server/.env
  ```
- Run the local development server:
  ```bash
  npm run dev
  ```

### 3. Commit Guidelines
We follow standard Conventional Commits:
- `feat(...)`: A new feature or capability
- `fix(...)`: A bug fix
- `test(...)`: Adding or updating tests
- `docs(...)`: Documentation changes
- `refactor(...)`: Code refactoring without functionality changes

### 4. Quality Checks Before Submitting PR
Ensure all automated checks pass locally before opening a pull request:
```bash
# 1. Check ESLint
npm run lint -w client

# 2. Run backend automated test suites
npm test -w server

# 3. Verify production client build
npm run build -w client
```

---

## 📬 Reporting Issues
If you encounter a bug or have a suggestion, please open an issue on GitHub:
👉 [https://github.com/Anji0522/socialConnect/issues](https://github.com/Anji0522/socialConnect/issues)
Include steps to reproduce, expected vs. actual behavior, and relevant logs or screenshots.
