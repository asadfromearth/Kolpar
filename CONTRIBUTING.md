# Contributing to Kolpar

Thank you for your interest in contributing to Kolpar!

## Guiding Principles
- **Minimal dependencies**: Keep third-party packages to a minimum.
- **Client-only architecture**: Never add backend, cloud, analytics, telemetry, or network-bound features.
- **Pure core logic**: All CSV transformation and parsing functions must reside in `src/core/` and remain pure, immutable, and testable without React.
- **Strict test coverage**: All features, operations, and edge cases must have accompanying unit tests.

## Development Workflow

1. **Clone the repository and install dependencies**:
   ```bash
   git clone https://github.com/your-username/kolpar.git
   cd kolpar
   npm install
   ```

2. **Run tests**:
   ```bash
   npm test
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```

4. **Verify production build**:
   ```bash
   npm run build
   ```

## Pull Request Guidelines
- Ensure all tests pass (`npm test`) and typechecks succeed (`npm run build`).
- Keep components small and focused.
- Adhere to the scoped v0.1 requirements.
