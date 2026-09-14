# Ivy Homes Property API — Engineering Assignment

This repository contains the complete solution for the Ivy Homes Engineering Assignment. It consists of a data-engineering pipeline to extract and verify the truth, a Spring Boot Backend-For-Frontend (BFF) to sanitize the data, and a React frontend.

## 🚀 How to Run It

### 1. The Backend Proxy (Spring Boot)

The backend acts as a shield, securely holding the API key and manually applying filters that the real API fails to enforce.

1. Navigate to the `backend` directory.
2. Update `src/main/resources/application.properties` with your actual API key:

   ```properties
   ivy.api.key=IVY26-EAC7A0516D5D
   ```

3. Run the application using Maven:

   ```bash
   mvn spring-boot:run
   ```

4. The server will start on `http://localhost:8080`.

### 2. The Frontend (React + Vite)

1. Navigate to the `frontend` directory.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173`.

   > **Note:** Use the provided demo accounts, e.g., `demo1@ivy.homes`, `demo1@ivy.homes`, `demo3@ivy.homes` to log in.

### 3. Data Extraction (Optional)

The raw Python extraction scripts used to answer the 10 data questions are located in the `data-scripts` folder.

Run:

```bash
python final_analyzer.py
```

to see the exact calculations for the dataset anomalies.

---

## 🕵️ The Investigation: Distrusting the Documentation

The API reference was highly inaccurate. I built a Python extraction pipeline early on to pull the entire dataset offline. This allowed me to test hypotheses without hitting rate limits.

Here is how I handled the major discrepancies:

- **The Pagination Trap:** The docs claimed a 200-item limit and standard pagination based on the `total` field. I discovered the API silently caps limits at 50 and *never* returns an empty array, which traps standard scrapers in infinite loops. I fixed this by calculating the exact page count based on the enforced 50-limit on the very first request.

- **The Dead Properties:** The docs claimed inactive properties were excluded server-side. I noticed the assignment hinted at an `is_live` boolean, proving this false. I built the Spring Boot BFF to intercept the API data and filter out dead properties before passing them to the React frontend.

- **The Units Lie:** The docs claimed all currency was in Indian Rupees. My data script crashed when calculating square footage prices because project prices were returned in decimals (Lakhs and Crores). I manually converted these by multiplying by `100,000` and `10,000,000` respectively in the React UI.

---

## ✅ False Alarms: What Checked Out Fine

Not everything was a lie. Here are a few hypotheses I tested that turned out to be perfectly fine:

1. **Hypothesis: The API's error messages are fake or misleading.**
   - **Result:** False. The error messages are incredibly honest. When I failed to authenticate, the API explicitly told me I was missing the undocumented `X-API-Key` header. When my token expired, it explicitly told me to use a refresh flow. The API's error responses are actually the single best source of truth.

2. **Hypothesis: The `page` parameter is ignored or broken.**
   - **Result:** False. While the `limit` parameter is capped, the `page` parameter perfectly navigates the dataset as expected.

3. **Hypothesis: The Demo Accounts lack data permissions.**
   - **Result:** False. Once the undocumented headers were provided, the demo accounts successfully authenticated and retrieved the exact same massive dataset as any admin account would.

---

## ⏳ What I Would Do With Another Two Days

If I had another 48 hours to expand this architecture, I would implement:

1. **A Real Database Cache (PostgreSQL/Redis):**  
   Instead of proxying requests live to `solve.ivy.homes` on every page load, the Spring Boot backend would run a scheduled cron job to sync the active dataset into a local PostgreSQL database. The React frontend would then query this ultra-fast, local database.

2. **Proper JWT Decoding:**  
   Currently, the frontend relies on the login payload to identify the user. I would add a library to decode the JWT on the client side to securely extract user scopes and expiration times.

3. **Automated Refresh Flow:**  
   The API uses a 15-minute token expiry. I would build an Axios interceptor in React to silently catch `401` errors, ping a `/refresh` endpoint on the Spring Boot server, and retry the failed request without interrupting the user experience.

---

## 🤖 LLM Usage Declaration

As permitted and expected by the assignment instructions, I utilized an LLM (Gemini) as a pair-programming assistant to brainstorm hypothesis testing strategies for the data anomalies, script the initial Python extraction pipeline, and scaffold the React component structure.

All final analytical deductions and architectural decisions (like implementing a Spring Boot BFF) were directed and verified by me.
