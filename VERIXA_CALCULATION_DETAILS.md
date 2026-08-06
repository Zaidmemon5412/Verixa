# 📐 VERIXA — All Scoring & Calculation Formulas Guide

> **Document Purpose:** Complete technical reference guide explaining step-by-step how **AI Fair Price**, **Confidence Score**, **Deal Verdicts**, **Locality Intelligence Scores (6 Sub-scores)**, and **Property Comparison Metrics** are calculated in the Verixa platform.

---

## 📑 Table of Contents
1. [AI Fair Price & Valuation Engine](#1-ai-fair-price--valuation-engine)
2. [Locality Intelligence Scorecard Engine](#2-locality-intelligence-scorecard-engine)
3. [Property Deal Verdict Logic](#3-property-deal-verdict-logic)
4. [Property Comparison Matrix Metrics](#4-property-comparison-matrix-metrics)
5. [Quick Formula Cheatsheet for Viva](#5-quick-formula-cheatsheet-for-viva)

---

## 🤖 1. AI Fair Price & Valuation Engine

The **AI Fair Price Engine** (`ml/prediction_service.py` & `ml/train.py`) uses Machine Learning regression models to estimate the true market value of a property.

### **A. Input Features Used by Model**
* `carpet_area` (sqft)
* `bhk` (1, 2, 3, 4, 5+ BHK)
* `locality_name` (Categorical One-Hot / Frequency Encoded)
* `property_type` (Apartment, Villa, Penthouse)
* `furnishing_status` (Furnished, Semi-Furnished, Unfurnished)
* `floor` & `total_floors`
* `property_age` (Years)

### **B. Fair Price Prediction Formula ($P_{fair}$)**
$$P_{fair} = \text{EnsembleModel.predict}(X_{transformed})$$
*(Floored at a minimum of ₹1,000,000 / ₹1 Lakh to prevent negative or non-sensical outputs).*

---

### **C. AI Confidence Score Calculation (70% - 98.5%)**

The **Model Confidence Score** is dynamically computed using a 4-part formula:

$$\text{Confidence Score} = \text{Base} + \text{Completeness Bonus} + \text{Area Factor} + \text{Estimator Variance Bonus}$$

1. **Base Confidence:** $88.0\%$
2. **Feature Completeness Bonus (Max +7%):**
   $$\text{Completeness Bonus} = \left( \frac{\text{Present Essential Keys}}{5} \right) \times 7.0\%$$
   *(Essential keys: `carpet_area`, `bhk`, `locality_name`, `property_type`, `furnishing_status`)*

3. **Price-per-sqft Boundary Validation (Max +3% / Min -5%):**
   $$\text{PSF} = \frac{P_{fair}}{\text{Carpet Area}}$$
   $$\text{Area Factor} = \begin{cases} +3.0\% & \text{if } ₹3,000 \le \text{PSF} \le ₹120,000 / \text{sqft} \\ -5.0\% & \text{otherwise (outlier anomaly)} \end{cases}$$

4. **Tree Estimator Variance Bonus (Ensemble Consensus):**
   For Random Forest / Gradient Boosting tree estimators ($N = 30$ trees):
   $$\text{Coefficient of Variation (CV)} = \frac{\sigma_{\text{tree\_predictions}}}{P_{fair}}$$
   $$\text{Variance Bonus} = \begin{cases} +2.0\% & \text{if } CV < 0.10 \text{ (high tree consensus)} \\ -3.0\% & \text{if } CV > 0.25 \text{ (high variance)} \end{cases}$$

5. **Final Clipping:**
   $$\text{Confidence Score} = \min(98.5\%, \max(70.0\%, \text{Total Score}))$$

---

## 🏷️ 2. Property Deal Verdict Logic

To categorize a listing as **Good Deal (Bargain)**, **Fairly Priced**, or **Overpriced** (`AIFairPriceCard.jsx`):

### **Price Difference Percentage Formula ($\Delta\%$):**
$$\Delta\% = \left( \frac{P_{listed} - P_{fair}}{P_{fair}} \right) \times 100$$

### **Verdict Classification Rules:**

| Verdict Status | Color | Condition | Meaning |
| :--- | :--- | :--- | :--- |
| **Good Deal (Bargain)** | 🟢 Green | $P_{listed} < 0.97 \times P_{fair}$ ($\Delta\% < -3\%$) | Listed price is >3% below AI Fair Market Value |
| **Fairly Priced** | 🟡 Yellow | $0.97 \times P_{fair} \le P_{listed} \le 1.03 \times P_{fair}$ ($-3\% \le \Delta\% \le +3\%$) | Listed price is within 3% market equilibrium |
| **Overpriced** | 🔴 Red | $P_{listed} > 1.03 \times P_{fair}$ ($\Delta\% > +3\%$) | Listed price is >3% higher than AI Fair Market Value |

---

## 🗺️ 3. Locality Intelligence Scorecard Engine

The **Locality Scorecard Engine** (`backend/apps/locations/scorecard_engine.py`) evaluates localities on a **0-100 scale** across 6 distinct sub-scores based on spatial data from OpenStreetMap.

---

### **A. Sub-Score 1: Connectivity Score (25% Weight)**
Measures transport accessibility, metro proximity, and highway connectivity:

$$\text{Connectivity Score} = 0.25(S_{\text{metro}}) + 0.25(S_{\text{highway}}) + 0.20(S_{\text{transit}}) + 0.15(S_{\text{traffic}}) + 0.15(S_{\text{biz\_hub}})$$

* **Metro Access ($S_{\text{metro}}$):** $\min(100, \max(40, 100 - (\text{Metro Distance in km} \times 10)))$
* **Highway Conn ($S_{\text{highway}}$):** $\min(98, \max(50, 60 + \text{Transit Stops Count} \times 1.8))$
* **Public Transport ($S_{\text{transit}}$):** $\min(98, \max(45, 55 + \text{Transit Stops Count} \times 1.6))$
* **Traffic Condition ($S_{\text{traffic}}$):** High Traffic = 65, Medium Traffic = 80, Smooth Flow = 90
* **Business Hub ($S_{\text{biz\_hub}}$):** $\min(98, \max(50, 65 + (\text{Avg PSF} // 400)))$

---

### **B. Sub-Score 2: Social Infrastructure Score (20% Weight)**
Evaluates lifestyle, education, healthcare, and commercial amenities:

$$\text{Social Infra Score} = 0.25(S_{\text{schools}}) + 0.25(S_{\text{hospitals}}) + 0.20(S_{\text{shopping}}) + 0.15(S_{\text{parks}}) + 0.15(S_{\text{convenience}})$$

* **Schools Score ($S_{\text{schools}}$):** $\min(100, \max(40, 50 + \text{Schools Count} \times 2.0))$
* **Hospitals Score ($S_{\text{hospitals}}$):** $\min(100, \max(40, 50 + \text{Hospitals Count} \times 3.2))$
* **Shopping Score ($S_{\text{shopping}}$):** $\min(100, \max(40, 50 + \text{Shopping/Malls Count} \times 2.5))$
* **Parks Score ($S_{\text{parks}}$):** $\min(100, \max(40, 55 + \text{Parks Count} \times 3.5))$

---

### **C. Sub-Score 3: Price Appreciation Score (30% Weight)**
Measures capital growth potential and price stability:

$$\text{Price Appreciation Score} = 0.70(S_{\text{hist\_growth}}) + 0.30(S_{\text{stability}})$$

* **Historical Growth ($S_{\text{hist\_growth}}$):** $\min(98, \max(50, 50 + \frac{\text{Avg PSF} - 3500}{95.0}))$
* **Market Stability Index ($S_{\text{stability}}$):** $\min(98, \max(55, 96 - \frac{\text{StdDev(PSF)}}{90.0}))$

---

### **D. Sub-Score 4: Rental Demand Score (15% Weight)**
Measures investor yield and occupancy demand:

$$\text{Rental Demand Score} = 0.50(S_{\text{yield}}) + 0.50(S_{\text{occupancy}})$$

* **Rental Yield %:** $\min(4.2\%, \max(2.8\%, 2.5\% + \frac{\text{Avg PSF}}{4500.0}))$
* **Yield Score ($S_{\text{yield}}$):** $\min(100, \max(50, \text{Rental Yield \%} \times 22))$
* **Occupancy Score ($S_{\text{occupancy}}$):** $\min(98, \max(50, 55 + \text{Property Count} \times 0.28))$

---

### **E. Sub-Score 5: Safety Score (10% Weight)**
Measures neighborhood safety and public infrastructure:

$$\text{Safety Score} = 0.40(S_{\text{safety\_rating}}) + 0.30(S_{\text{public\_infra}}) + 0.30(S_{\text{traffic\_risk}})$$

* **Safety Rating:** $\min(98, \max(75, 70 + (\text{Schools} + \text{Hospitals}) \times 0.4))$
* **Public Infra Safety:** $\min(98, \max(60, 70 + \text{SocialInfraScore} \times 0.25))$

---

### **F. Overall Locality Growth Score (The Final Score)**

$$\text{Overall Growth Score} = 0.30(S_{\text{appreciation}}) + 0.25(S_{\text{connectivity}}) + 0.20(S_{\text{social\_infra}}) + 0.15(S_{\text{rental\_demand}}) + 0.10(S_{\text{safety}})$$

#### **Verixa Verdict Mapping:**
* **$\ge 90$ Score:** *Excellent Investment* 🌟
* **$80 - 89$ Score:** *Strong Investment* 💪
* **$70 - 79$ Score:** *Good Investment* 👍
* **$60 - 69$ Score:** *Average Investment* ⚖️
* **$< 60$ Score:** *High Risk* ⚠️

---

## ⚖️ 4. Property Comparison Matrix Metrics

When comparing properties side-by-side (`usePropertyComparison.js`), Verixa calculates comparison delta metrics:

1. **Price per Sqft Ratio:**
   $$\text{Price per Sqft} = \frac{\text{Listed Price}}{\text{Carpet Area (sqft)}}$$

2. **Valuation Difference Ratio:**
   $$\text{Valuation Ratio} = \frac{\text{Listed Price}}{\text{AI Fair Price}}$$
   *(Ratio $< 1.0$ indicates undervaluation/bargain, Ratio $> 1.0$ indicates overvaluation).*

3. **Locality Advantage Score:**
   $$\Delta \text{Locality} = \text{LocalityScore}_{\text{PropA}} - \text{LocalityScore}_{\text{PropB}}$$

---

## ⚡ 5. Quick Formula Cheatsheet for Viva

If the examiner asks:

* **"Fair price percentage diff kaise nikalte hain?"**  
  👉 $\Delta\% = \frac{\text{Listed Price} - \text{AI Fair Price}}{\text{AI Fair Price}} \times 100$. Agar $\Delta\% < -3\%$, to **Good Deal**; $+3\%$ se bada ho to **Overpriced**.

* **"Confidence score 88% se 95% kaise hua?"**  
  👉 Base score $88\%$ hai. Agar saare 5 essential parameters filled hain to $+7\%$ bonus milta hai, aur price per sqft normal market range me hone par $+3\%$ extra add hota hai.

* **"Overall Locality Growth Score ka formula kya hai?"**  
  👉 Weighted sum: **30% Price Growth + 25% Connectivity + 20% Social Infra + 15% Rental Demand + 10% Safety**.

* **"Metro distance score me weightage kitna hai?"**  
  👉 Connectivity score me Metro access ka 25% weightage hai. Distance 0.1 km ke steps me max 100 points se minus hota hai.
