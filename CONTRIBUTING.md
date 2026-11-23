# Contributing Guidelines

Thank you for contributing to the Urban Air Quality Assistant project.

## Development Workflow

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/salonithebest/urban-air-quality-assistant.git
   cd urban-air-quality-assistant
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Type Checks & Linters**:
   ```bash
   npm run lint
   ```

4. **Execute Test Suite**:
   ```bash
   npm run test
   ```

## Architecture Principles

- **Deterministic Separation**: Mathematical calculations (CPCB AQI breakpoints, carbon emissions, tree-year sequestration) must remain purely deterministic in TypeScript without generative AI interpolation.
- **Safety & Compliance**: Health guidelines must remain supportive and non-prescriptive, advising users to consult licensed medical professionals for medication dosages.
- **Accessibility**: All interactive elements must maintain WCAG 2.1 AA/AAA compliance, including keyboard navigable focus states and ARIA metadata.
