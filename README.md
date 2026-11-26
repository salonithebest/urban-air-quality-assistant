# Urban Air Quality Assistant

> **Google PromptWars Challenge 06: Urban Air Quality Assistant**  
> A family-focused air-quality planner for Indian cities. It shows live estimated AQI using official CPCB formulas, explains personalized health impacts for each family member, provides actionable low-emission routines and indoor air tips, and computes deterministic CO₂ savings against solo car driving.

---

## 🌟 Key Highlights

1. **Deterministic CPCB National AQI Calculation**:
   - Implements the official Central Pollution Control Board (CPCB) linear interpolation sub-index calculation.
   - Evaluates all 6 key pollutants: $\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$, $\text{SO}_2$, $\text{O}_3$, and $\text{CO}$.
   - Automatically determines the **prominent pollutant** and enforces the **CPCB minimum data rule** ($\ge 3$ pollutants with at least one PM).
   - Handles the critical unit conversion for Carbon Monoxide ($\mu\text{g/m}^3 \rightarrow \text{mg/m}^3$) before sub-index lookup.

2. **Personalized Family Protection Engine**:
   - Adapts health advisories and action steps to vulnerable family roles (infants, children, seniors, asthmatic/respiratory conditions, cardiac conditions, pregnancy, or healthy adults).
   - Stores profiles locally in `localStorage` for privacy and persistence.

3. **Deterministic CO₂ Savings Engine**:
   - Pure mathematical model estimating daily and annual carbon savings ($\text{kg CO}_2$) when shifting from petrol car commuting to metro, walking, cycling, CNG auto-rickshaws, or working from home.
   - Converts annual savings into equivalent **tree-days** offset based on USDA Forest Service absorption figures ($\sim 21\text{ kg CO}_2/\text{year}$).

4. **Architectural Separation from AI**:
   - **Math & Science are 100% deterministic**: AQI sub-indices, CPCB categories, and CO₂ savings are computed server-side in pure TypeScript functions before AI is invoked.
   - **Gemini 2.0 Flash is for natural language wording only**: Structured JSON responses generate tailored family tips, ensuring zero hallucinated numbers.
   - Built-in in-memory caching and offline deterministic fallbacks guarantee 100% test pass rates and demo resilience.

---

## 🛠️ Tech Stack

- **Client**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons
- **Server**: Node.js, Express, TypeScript, Zod, Helmet, Express Rate Limit, CORS
- **AI / LLM**: Google Gemini API (`gemini-2.0-flash`) via `@google/generative-ai`
- **Atmospheric Data**: Open-Meteo Air Quality API (Global, Keyless, CC-BY 4.0)
- **Testing**: Vitest, Supertest (100% deterministic tests with 90/90 passing)

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Node.js 20+ installed
- Git installed
- *(Optional)* Gemini API Key from [Google AI Studio](https://aistudio.google.com/) (app includes a built-in deterministic fallback if no key is supplied)

### 1. Clone the repository
```bash
git clone https://github.com/salonithebest/urban-air-quality-assistant.git
cd urban-air-quality-assistant
```

### 2. Configure Environment Variables
Copy `.env.example` in the server directory or root:
```bash
cp .env.example .env
```
Add your Gemini API key:
```env
PORT=3001
NODE_ENV=development
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Install Dependencies
```bash
# Install root, client, and server dependencies
npm install
npm run install --workspace=server
npm run install --workspace=client
```

### 4. Run the Test Suite
```bash
npm test
```
*Runs all 90 unit and integration tests across CPCB AQI breakpoints, CO₂ calculations, Zod validation, and API routes.*

### 5. Start the Application

Open two terminal sessions or run:

**Terminal 1 (Backend Server):**
```bash
npm run dev:server
# Server runs on http://localhost:3001
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev:client
# Vite runs on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📊 CO₂ Emission Factor Sourcing

All transport emission factors are stored centrally in `server/src/config/emissionFactors.ts` and labelled as **approximate** in the UI:

| Transport Mode | Factor ($\text{kg CO}_2/\text{km}$) | Primary Source | Basis / Details |
|---|---|---|---|
| **Car (Petrol)** | **0.140** | India GHG Program / Shakti Sustainable Energy Foundation (2023) | Mid-range for common Indian petrol hatchback/sedan ($0.111 - 0.166\text{ kg/km}$) with 10% real-world uplift. |
| **Bike / Scooter (Petrol)** | **0.040** | India GHG Program / Shakti Sustainable Energy Foundation (2023) | Mid-range for scooter $<150\text{ CC}$ with 10% uplift ($0.037 - 0.047\text{ kg/km}$). |
| **Auto-rickshaw (CNG)** | **0.090** | IPCC 2006 Mobile Combustion & TERI / Shakti Literature | IPCC CNG emission factor ($2.69\text{ kg CO}_2/\text{kg}$) $\div$ Indian auto fuel efficiency ($30\text{ km/kg}$). |
| **Metro / Rail** | **0.032** | TERI / Delhi Metro Rail Corp (DMRC) | Derived from CEA India grid emission factor applied to per-passenger-km traction energy use. |
| **Walk / Cycle / WFH** | **0.000** | — | Zero tailpipe / commute emissions. |

*Tree equivalent calculation: $1\text{ tree absorbs }\sim 21\text{ kg CO}_2/\text{year}$ (USDA Forest Service).*

---

## ⚠️ Known Limitations & Disclaimers

1. **Model Forecast vs. Ground Sensor Station**:
   The atmospheric data is retrieved from Open-Meteo's CAMS global assimilation model. While it provides continuous, reliable coverage for all Indian cities without key requirements, numerical model forecasts may vary by 20–40% from hyper-local ground-truth monitors (e.g., CPCB manual/continuous CAAQMS stations). For regulatory purposes, consult the official [CPCB Sameer Portal](https://app.cpcbccr.com).
2. **Averaging Window Pragmatism**:
   Official CPCB guidelines calculate sub-indices based on 24-hour averages for particulates/gases and 8-hour rolling averages for $\text{O}_3$/$\text{CO}$. To deliver real-time responsiveness without multi-call historical roundtrips, this application calculates estimated AQI from the latest hourly model reading, explicitly disclosed on all output cards.
3. **Ammonia ($\text{NH}_3$) Availability**:
   Open-Meteo does not provide uniform continuous coverage for Ammonia across all Indian coordinates; therefore, $\text{NH}_3$ is excluded while satisfying the CPCB requirement of at least 3 valid monitored criteria pollutants including $\text{PM}_{2.5}$ or $\text{PM}_{10}$.
4. **No User Authentication & In-Memory Rate Limiting**:
   The application intentionally operates without user authentication (no mandatory API keys, JWT, or database sessions) to support frictionless public evaluation and privacy-first client-side profiling. To protect upstream LLM quota from abuse without session state, `/api/advice` is protected via per-IP in-memory rate limiting (5 requests per 1 minute) coupled with deterministic response caching.

---

## 📜 Attribution & License

- Atmospheric composition data provided by [Open-Meteo Air Quality API](https://open-meteo.com/) under the [Creative Commons Attribution 4.0 International (CC-BY 4.0)](https://creativecommons.org/licenses/by/4.0/) license.
- Developed for Google PromptWars Challenge 06.
