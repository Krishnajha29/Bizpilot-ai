import { GoogleGenAI } from "@google/genai";

// Business context loaded to guide AI responses
export const BUSINESS_CONTEXT = `
You are BizPilot AI, an elite, brilliant AI Business Copilot and CFO Advisor for Apex Builders Supply & Paints (an SME based in India/Global selling construction materials, premium paints, metals, plywood, and tools).
Here is the current operational business state of Apex Builders Supply:
- Current Date/Year: July 2026

- Products:
  1. UltraShield Premium Wall Paint (20L) - Stock: 5 tubs (critically low), MinStock: 20, Price: $120, Cost: $85, Supplier: Apex Chemical Industries. Sales climbing 15% month-on-month.
  2. Portland Cement Grade 43 (50kg Bag) - Stock: 450 bags (healthy), MinStock: 100, Price: $8.50, Cost: $6.00, Supplier: UltraTech Cement Ltd. Demand up 28% due to local construction activity.
  3. TMT Steel Reinforcement Bars (12mm, 1 Ton) - Stock: 12 bundles, MinStock: 5, Price: $820, Cost: $690, Supplier: Tata Steel Corp. Pricing expected to rise by 4% next week.
  4. Clay Red Bricks (Pack of 1000) - Stock: 45 packs, MinStock: 25, Price: $150, Cost: $110, Supplier: Local Brick Kilns. Stable demand.
  5. Fine River Sand (1 Brass Truckload) - Stock: 2 truckloads (critically low), MinStock: 8, Price: $350, Cost: $240, Supplier: Sand Miners Syndicate. Mining bans in monsoon starting soon.
  6. Heavy Duty Brush Set (Pack of 5) - Stock: 85 packs, Price: $25, Cost: $15, Supplier: PaintTools Mfg. High profit margin (40%).
  7. Industrial Wood Primer (5L) - Stock: 18 cans, MinStock: 15, Price: $45, Cost: $32.
  8. Premium Teak Plywood (8x4 ft, 18mm) - Stock: 4 sheets (critically low), MinStock: 15, Price: $65, Cost: $46, Supplier: GreenPly Industries. Sales are up 22%.
  9. Universal Screws Box (1000 Pcs) - Stock: 140 boxes, Price: $12, Cost: $7.50.

- Customers:
  - Sharma Traders: Outstanding Balance: $4,200. Total spent: $28,500. Last order: June 25, 2026. (Term terms: 30 days, payment overdue).
  - Verma Construction: Outstanding Balance: $0. Total spent: $48,900. Last order: July 2, 2026.
  - Gupta & Sons Ltd: Outstanding Balance: $1,250. Total spent: $18,200. Last order: June 18, 2026.
  - Elite Builders & Architects: Outstanding Balance: $8,500. Total spent: $92,400. Last order: July 5, 2026.
  - Royal Paints Decor: Outstanding Balance: $0. Total spent: $12,400.

- Monthly Financial History (Jan-Jun):
  - Revenue: Jan: $21.5k, Feb: $24.2k, Mar: $28.9k, Apr: $26.5k, May: $31.2k, Jun: $32.15k
  - Profit: Jan: $7k, Feb: $7.4k, Mar: $9.8k, Apr: $8.3k, May: $9.7k, Jun: $9.05k

Always answer business questions with professional financial and operational details matching the above metrics.
When requested to:
- Generate a quotation: provide structured items, pricing, discounts, GST, and elegant formatting.
- Provide insights or recommendations: cite the exact stock levels (e.g., UltraShield Paint is down to 5, Sand is 2, Teak Plywood is 4).
- Write a payment reminder: address to Sharma Traders or Elite Builders and craft a polite but firm professional notice.
`;

// Smart local fallback responses if API is down/unset
export function generateSmartMockResponse(prompt: string): string {
  const p = prompt.toLowerCase();
  
  if (p.includes('quotation') || p.includes('quote')) {
    return `### **OFFICIAL QUOTATION**
**Apex Builders Supply & Paints**  
*Date: ${new Date().toISOString().split('T')[0]}*  
*Quotation ID: QT-2026-092*

**Prepared For:** Verma Construction  
**Valid Until:** 30 Days from issue

---

| Item Description | Unit | Qty | Unit Price ($) | Subtotal ($) |
| :--- | :--- | :--- | :--- | :--- |
| **Portland Cement Grade 43 (50kg Bag)** | Bag | 200 | $8.50 | $1,700.00 |
| **TMT Steel Reinforcement Bars (12mm)** | Bundle | 5 | $820.00 | $4,100.00 |
| **Premium Teak Plywood (8x4 ft)** | Sheet | 10 | $65.00 | $650.00 |

---

**Financial Breakdown:**
- **Gross Subtotal:** $6,450.00
- **Volume Discount Applied (5%):** -$322.50
- **Taxable Amount:** $6,127.50
- **GST / Sales Tax (18%):** $1,102.95
- **Grand Total (Inc. Taxes):** **$7,230.45**

**Terms & Conditions:**
1. Delivery within 3 business days of confirmation.
2. 50% advance, balance on delivery.
3. Pricing locked for 14 days.

*Generated automatically by BizPilot AI.*`;
  }

  if (p.includes('invoice') || p.includes('gst')) {
    return `### **TAX INVOICE**
**Apex Builders Supply & Paints**  
*GSTIN: 07AAAAA1111A1Z1*  
*Invoice No: INV-2026-408*  
*Date: 2026-07-07*

**Billed To:** Sharma Traders  
**Outstanding Balance:** $4,200.00 (OVERDUE)

---

| Item Description | HSN | Qty | Rate ($) | GST % | GST Amount ($) | Total ($) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UltraShield Premium Wall Paint (20L)** | 3209 | 30 | $120.00 | 18% | $648.00 | $4,248.00 |
| **Industrial Wood Primer (5L)** | 3208 | 20 | $45.00 | 18% | $162.00 | $1,062.00 |

---

**Summary:**
- **Taxable Value:** $4,500.00
- **Total Integrated GST (18%):** $810.00
- **Invoice Amount:** **$5,310.00**
- **Payments Received:** $1,110.00
- **Balance Due:** **$4,200.00**

*Payment terms overdue by 12 days. Please clear the pending dues immediately to avoid late interest fees of 1.5% per month.*`;
  }

  if (p.includes('analyze') || p.includes('sales') || p.includes('predict') || p.includes('revenue')) {
    return `### **BIZPILOT FINANCIAL PERFORMANCE & DEMAND FORECAST**

Based on our current H1 2026 sales velocity, **Apex Builders Supply & Paints** is showing a robust upward trajectory. Here is the AI diagnostic:

#### **1. Core Financial Trajectory**
- **Monthly Revenue growth:** Steady increase from **$21,500** in January to **$32,150** in June (+49.5% cumulative growth).
- **Profitability:** June net margins stabilized at **28.1%** ($9,050 net profit). However, there has been a **3% margin slippage** due to rising freight and metal transport fees.

#### **2. Category Diagnostics**
- **High-Velocity Drivers:** Portland Cement Grade 43 demand is up **28%** MoM.
- **Underperforming Assets:** Fine River Sand is down **5%** due to weather preparation, but impending mining restrictions will cause a supply shock.
- **Stock Alert Warnings:** UltraShield Wall Paint is at a critical **5 tubs left** against a min threshold of 20. Plywood is at **4 sheets left**.

#### **3. Projections for Q3 2026**
- **Predicted July Revenue:** **$34,800** (Expected confidence level: 92%).
- **Key Risks:** Overdue accounts receivable of **$13,950** (primarily Elite Builders at $8.5k and Sharma Traders at $4.2k) are choking operational cash flow.

#### **Recommended Strategic Moves:**
1. **Capital Infusion:** Immediately place orders for **Plywood (20 sheets)** and **Paint (30 tubs)** to capture seasonal decoration sales.
2. **Receivable Collections:** Dispatch the AI-generated payment notice to Sharma Traders immediately.`;
  }

  if (p.includes('email') || p.includes('follow-up') || p.includes('reminder')) {
    return `### **AI-GENERATED FOLLOW-UP EMAIL**

**Subject:** Urgent: Outstanding Balance Review - Apex Builders Supply & Paints

**To:** purchase@sharmatraders.com  
**Cc:** accounts@apexbuilders.com

Dear Sharma Traders Team,

I hope this email finds you well.

This is a friendly reminder that an outstanding balance of **$4,200.00** under invoice **INV-2026-101** remains overdue on your account. The invoice was issued on June 25, 2026, with net-30 payment terms.

To prevent any interruptions in your supply chain shipments of UltraShield Wall Paint and Building Materials, we kindly request that you settle this payment at your earliest convenience.

**Payment Summary:**
- **Outstanding Overdue:** $4,200.00
- **Due Date:** June 25, 2026

Please find the attached active ledger statement for your reference. If payment has already been initiated, please reply with the transaction receipt so we can credit your account.

We appreciate your business and thank you for your cooperation.

Sincerely,  
**Operations & Finance Team**  
*Apex Builders Supply & Paints*`;
  }

  if (p.includes('campaign') || p.includes('marketing')) {
    return `### **Q3 STRATEGIC MARKETING CAMPAIGN & BUNDLE STRATEGY**

To maximize our profits and clear stock of slower accessories, BizPilot recommends the **"Summer Refresh & Structural Integrity"** promotional framework:

#### **Campaign 1: The "Premium Paint Refresh" Bundle**
- **Target Audience:** Contractors and retail decorators.
- **The Deal:** Buy 3 Tubs of *UltraShield Premium Wall Paint (20L)* and get **1 Heavy Duty Brush Set (Pack of 5)** at **50% Off**.
- **Financial Rationale:** UltraShield Paint has a gross margin of **29%** ($35 profit per tub). Heavy Duty Brushes have a high margin of **40%** but move slowly. Combining them clears accessory stock and increases total paint cart size by 15%.

#### **Campaign 2: The "Foundation Builder" Discount**
- **Target Audience:** Commercial builders (like Verma Construction, Elite Builders).
- **The Deal:** Buy **1000 Bags of Portland Cement Grade 43**, get **1 Bundle of TMT Steel Reinforcement Bars at 5% Off**.
- **Financial Rationale:** Cement is a high-volume, low-margin driver. Steel bars are high-value. This incentive locks in the client for their steel requirements which usually go to separate competitors.

#### **Ad copy recommendation:**
> *"Apex Builders Summer Supply: Lock in your steel prices before market rates climb next week, and get your premium cement priority-dispatched today!"*`;
  }

  if (p.includes('profit') || p.includes('increase')) {
    return `### **BIZPILOT FINANCIAL ADVISORY: 4 STEPS TO GROW NET PROFIT BY 8%**

Based on analytical review of our financials, Apex Builders Supply can implement these high-yield levers:

1. **Resolve Freight Cost Leakage on Structural Metals**
   - *Current Issue:* Profit margin slipped by **3%** because we absorb metal logistics fees for TMT reinforcement steel.
   - *Fix:* Set a minimum order quantity (MOQ) of 5 Bundles for free delivery, or pass a $50 flat transport fee to the client.

2. **Capitalize on Steel Price Arbitrage**
   - *Action:* Pricing for TMT Steel Bars is forecasted to increase by **4%** next week due to tariff changes. Pre-purchasing **10 bundles** now will lock in lower costs and increase profit spread on sales.

3. **Incentivize Collections to Boost Working Capital**
   - *Action:* Offer a **0.5% early settlement discount** for payments received within 10 days of invoice date (e.g., Elite Builders and Sharma Traders). This is cheaper than commercial short-term loans.

4. **Product Cross-Selling**
   - *Action:* Cross-sell slow-moving, high-margin accessories (Brushes, Universal Screws) during checkout of bulk building materials. Create an automated checkout prompt in the sales dashboard.`;
  }

  // General fallback
  return `### **BizPilot Copilot AI Assistant**

I am your business partner for **Apex Builders Supply & Paints**. Here is a quick review of key operational tasks I can assist you with:

- 📑 **Quotation Creation**: Ask me to "Generate a quotation" for cements, metals, or plywood.
- 💰 **Cash Flow & Invoices**: Ask "Analyze sales and pending payments" to identify overdue accounts.
- 📈 **Growth Advisory**: Ask "How can I increase profit margins?"
- 📦 **Inventory Logistics**: Ask me to analyze low stocks (like paint and plywood) and generate supplier emails.

What can I help you automate or analyze today?`;
}

// Lazy initialization of Gemini client using client-side API key
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;

  // WARNING: Exposing VITE_GEMINI_API_KEY in frontend builds carries security risks.
  // In production, keep this server-side.
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '') {
    try {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      console.log("Client-side Gemini AI successfully initialized.");
      return aiClient;
    } catch (err) {
      console.error("Error initializing client-side Gemini AI SDK:", err);
    }
  }
  return null;
}

/**
 * Executes a Copilot prompt on the client side using VITE_GEMINI_API_KEY
 */
export async function getCopilotResponse(prompt: string, history: any[] = []): Promise<string> {
  const client = getGeminiClient();

  if (!client) {
    console.log("Gemini API key not configured or invalid. Serving local smart mock backup.");
    return generateSmartMockResponse(prompt);
  }

  try {
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const contents = [
      ...formattedHistory,
      { role: 'user', parts: [{ text: prompt }] }
    ];

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction: BUSINESS_CONTEXT,
        temperature: 0.7,
      },
    });

    return response.text || generateSmartMockResponse(prompt);
  } catch (error) {
    console.error("Gemini client-side call failed, falling back:", error);
    return generateSmartMockResponse(prompt);
  }
}

/**
 * Fetches automatic dashboard insights on the client side using VITE_GEMINI_API_KEY
 */
export async function getDashboardInsights(): Promise<{ recommendation: string; score: number }> {
  const client = getGeminiClient();

  const fallback = {
    recommendation: 'Reorder UltraShield Premium Paint (20L) and Fine River Sand today. Contact Sharma Traders to collect outstanding $4,200 payment.',
    score: 84
  };

  if (!client) {
    return fallback;
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'Provide a concise, single-sentence summary recommendation to display on the main dashboard for the CEO of Apex Builders Supply, along with an integer score from 1 to 100 indicating the current health of the business (where 100 is perfect and cash-flow/inventory are pristine). Output strictly as JSON with keys "recommendation" (string) and "score" (integer).',
      config: {
        systemInstruction: BUSINESS_CONTEXT,
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      recommendation: parsed.recommendation || fallback.recommendation,
      score: parsed.score || fallback.score
    };
  } catch (err) {
    console.error("Dashboard insights client-side call failed:", err);
    return fallback;
  }
}
