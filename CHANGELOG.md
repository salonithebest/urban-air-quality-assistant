# Changelog

All notable changes to the Urban Air Quality Assistant project are documented in this file.

## [1.2.0] - 2026-11-23

### Added
- Interactive hardware-accelerated 3D flip card animations for Personalized Family Member Health Protocols.
- Work from Home (WFH) mode automatically locking transit distance to 0 km and eliminating phantom commute emissions.
- WCAG 2.1 AAA accessibility skip links, ARIA live region landmarks, and high-contrast outline focus styles.
- Dual-tier autonomous client fallback engine enabling full offline resilience.
- Standardized architectural documentation in `ARCHITECTURE.md`.

### Changed
- Standardized project branding to Urban Air Quality Assistant across all client views, documentation, and metadata.
- Replaced medication timing with physician consultation guidance for asthmatic member profiles.
- Streamlined CPCB breakpoint calculation references and enabled strict typing across Express query and body handlers.

### Fixed
- Fixed TypeScript `TS7030` code path return warnings across API route controllers.
- Addressed accessibility color contrast and screen reader meter semantics for the AQI gauge.

## [1.0.0] - 2026-11-22

### Added
- Initial release for Google PromptWars Challenge 06.
- CPCB National AQI linear interpolation engine across 6 criteria pollutants.
- Real-time Open-Meteo European Copernicus atmospheric data ingestion with in-memory caching.
- Grounded Google Gemini 1.5 prompt pipeline with strict JSON schema validation.
- Deterministic carbon emissions calculator based on India GHG Protocol emission factors.
