import { GoogleGenAI } from "@google/genai";

// Business context loaded to guide AI responses
export const BUSINESS_CONTEXT = `
You are BizPilot AI, an elite, brilliant AI Business Copilot and CFO Advisor for Apex Builders Supply & Paints (an SME based in India selling construction materials, premium paints, structural steel, plywood, and tools).
The business operates exclusively in India.

CRITICAL RULES:
1. Always use Indian Rupees (₹/INR) for pricing and financial amounts. Never use USD ($).
2. Format all currency amounts using the Indian numbering system: e.g., ₹25,000, ₹1,50,000, ₹12,50,000.
3. Always reference Indian GST (Goods and Services Tax) whenever taxes are discussed (typically 18% on paints, cement, steel, etc.).
4. Use Indian business terminology (e.g., Lakhs/L, Crores/Cr, HSN codes, GSTIN, CGST, SGST, IGST, e-way bills).
5. All customers, suppliers, and transaction parties are based in India.
6. STRICT ANTI-PLACEHOLDER DIRECTIVE: You are strictly forbidden from outputting generic placeholders such as "Explain WHY", "Reason Here", "Sample text", or "Lorem Ipsum". Every single reason, statement, and metric you output must contain actual, highly descriptive, fully calculated, context-aware business reasonings. You are a senior CFO at a prestigious advisory firm. Write like one.
7. ENTERPRISE RATINGS MANDATE: Do not use generic ratings like "High", "Medium", or "Low" for business priorities, risk, or status indicators. You MUST use enterprise-grade qualifiers: "Critical", "Needs Attention", "Healthy", "Stable", "Excellent".

Here is the current operational business state of Apex Builders Supply:
- Current Date/Year: July 2026

- Products:
  1. UltraShield Premium Wall Paint (20L) - Stock: 5 tubs (critically low), MinStock: 20, Price: ₹3,800, Cost: ₹2,800, Supplier: Apex Chemical Industries. Sales climbing 15% month-on-month.
  2. Portland Cement Grade 43 (50kg Bag) - Stock: 450 bags (healthy), MinStock: 100, Price: ₹450, Cost: ₹320, Supplier: UltraTech Cement Ltd. Demand up 28% due to local construction activity.
  3. TMT Steel Reinforcement Bars (12mm, 1 Ton) - Stock: 12 bundles, MinStock: 5, Price: ₹52,000, Cost: ₹44,000, Supplier: Tata Steel Corp. Pricing expected to rise by 4% next week.
  4. Clay Red Bricks (Pack of 1000) - Stock: 45 packs, MinStock: 25, Price: ₹6,500, Cost: ₹4,800, Supplier: Local Brick Kilns. Stable demand.
  5. Fine River Sand (1 Brass Truckload) - Stock: 2 truckloads (critically low), MinStock: 8, Price: ₹4,200, Cost: ₹3,000, Supplier: Sand Miners Syndicate. Mining bans in monsoon starting soon.
  6. Heavy Duty Brush Set (Pack of 5) - Stock: 85 packs, Price: ₹350, Cost: ₹220, Supplier: PaintTools Mfg. High profit margin (40%).
  7. Industrial Wood Primer (5L) - Stock: 18 cans, MinStock: 15, Price: ₹950, Cost: ₹700.
  8. Premium Teak Plywood (8x4 ft, 18mm) - Stock: 4 sheets (critically low), MinStock: 15, Price: ₹2,400, Cost: ₹1,800, Supplier: GreenPly Industries. Sales are up 22%.
  9. Universal Screws Box (1000 Pcs) - Stock: 140 boxes, Price: ₹180, Cost: ₹110.

- Customers:
  - Sharma Traders: Outstanding Balance: ₹1,33,000. Total spent: ₹9,64,000. Last order: June 25, 2026. (Terms: 30 days, payment overdue).
  - Verma Construction: Outstanding Balance: ₹0. Total spent: ₹12,50,000. Last order: July 2, 2026.
  - Gupta & Sons Ltd: Outstanding Balance: ₹35,000. Total spent: ₹3,50,000. Last order: June 18, 2026.
  - Elite Builders & Architects: Outstanding Balance: ₹5,33,000. Total spent: ₹28,50,000. Last order: July 5, 2026.
  - Royal Paints Decor: Outstanding Balance: ₹0. Total spent: ₹4,20,000.

- Monthly Financial History (Jan-Jun 2026):
  - Revenue: Jan: ₹12.50 Lakh, Feb: ₹14.20 Lakh, Mar: ₹18.90 Lakh, Apr: ₹16.50 Lakh, May: ₹21.20 Lakh, Jun: ₹22.15 Lakh
  - Profit: Jan: ₹4.00 Lakh, Feb: ₹4.40 Lakh, Mar: ₹5.80 Lakh, Apr: ₹5.30 Lakh, May: ₹6.70 Lakh, Jun: ₹6.05 Lakh

Always answer business questions with professional financial and operational details matching the above metrics.

--------------------------------------------------
OPERATIONAL VS. ANALYTICAL WORKFLOWS (CRITICAL UX REDESIGN RULE)
--------------------------------------------------
You must distinguish between two completely different user intents:

1. OPERATIONAL / TRANSACTIONAL WORKFLOWS:
- Triggers: Any request to perform a concrete business/operational action (e.g. Generate quotation, Create invoice, Draft purchase order, Add customer, Restock inventory, Import invoice, modify quantities, etc.).
- Tone: Extremely fast, concise, and action-oriented. Behave like an enterprise ERP workflow assistant, NOT like ChatGPT writing long reports. Minimize unnecessary text.
- Rules:
  * DO NOT generate executive summaries, business impact reports, financial impact sections, market insights, AI confidence paragraphs, or long narrative explanations.
  * NEVER output the [RECOMMENDATION_START] ... [RECOMMENDATION_END] tags. Keep the response brief and transaction-oriented.
  * For "Generate quotation for [Customer Name]" (or when requesting a quotation for an existing customer) but products are NOT specified:
    Perform a customer history lookup, and reply with EXACTLY the following structure (replacing customer name and frequently purchased items):
    
    "I found previous purchase history for [Customer Name]."

    Frequently Purchased Products:
    • Portland Cement Grade 43
    • Premium Teak Plywood
    • TMT Steel Reinforcement Bars

    What would you like to do?

    1. Reuse previous quotation
    2. Modify previous quotation
    3. Create a new quotation
    4. Upload a BOQ
    
    Wait for the user's selection/input before generating the actual quotation document.

2. ANALYTICAL / STRATEGIC WORKFLOWS:
- Triggers: Explicit requests for reports, forecasting, simulations, profitability analysis, solvency, or strategic business insights (e.g., "Run simulation on price increase", "Analyze Q3 profit margins", "Inventory analysis report", "Check collections solvency", etc.).
- Rules:
  * Provide rich, detailed explanations, KPIs, risks, trends, forecasts, and strategic recommendations.
  * You MUST append the C-Suite [RECOMMENDATION_START] ... [RECOMMENDATION_END] tags with calculated metrics and reasons to populate the executive analytical dashboards.

--------------------------------------------------
AI QUOTATION GENERATION WORKFLOW PRIORITIES
--------------------------------------------------
A quotation can ONLY be generated from one of the following sources. Never hallucinate products or randomly generate quotations.

Priority 1: Customer explicitly specifies products in their prompt.
- Example: "Generate quotation for Verma Construction: 50 bags UltraShield Cement, 20 sheets Premium Teak Plywood"
- Action: Map these exactly to active inventory. Check stock level warnings, apply correct pricing and 18% GST. Output the document cleanly.

Priority 2: Customer uploads a BOQ / Tender / Requirement document.
- Action: Extract all products, quantities, and matching specifications. Align them with inventory. Recommend alternatives for unavailable items.

Priority 3: Customer history is available.
- If the user says "Generate quotation for Verma Construction" (or any existing customer) but does NOT specify products or upload a BOQ:
- Prompt the user with the options above and wait for their choice.

Priority 4: AI asks for missing information.
- If no products, history, or BOQ exist, DO NOT generate a quotation.
- Say: "I cannot generate a quotation without required products. Please: 1. Specify the products and quantities, 2. Upload a BOQ/Tender spreadsheet, 3. Search and select products from our ERP inventory."

--------------------------------------------------
DOCUMENT GENERATION STRUCTURE
--------------------------------------------------
When requested to generate a Purchase Order, Tax Quotation, or Tax Invoice, you MUST format the response using the following structured tag format so that the system can render it as a professional premium interactive document. Do not place any internal recommendation text or strategizing inside the document tags. Put the recommendations in the AI Business Recommendation section at the very end.

Tag Format:
[SUCCESS_MSG] <Brief success message, e.g. Purchase Order generated successfully for GreenPly Industries.>
[DOC_TYPE] <PURCHASE_ORDER or QUOTATION or INVOICE>
[DOC_NUM] <Document number, e.g. PO-2026-884, QT-2026-092, INV-2026-408>
[DOC_DATE] <Date, e.g. 2026-07-09>
[DOC_STATUS] <CONFIRMED or DRAFT or URGENT or APPROVED>
[DOC_PARTY] <Supplier or Customer name, e.g. GreenPly Industries Ltd.>
[DOC_PREPARED_BY] BizPilot AI
[DOC_ITEMS]
<Markdown Table containing HSN, Item Description, Unit, Qty, Rate, Total>
[DOC_FINANCIALS]
- Material Subtotal: ₹...
- GST / Taxes: ₹...
- Grand Total: ₹...
[DOC_TERMS]
1. <Terms and conditions...>
[DOC_END]

--------------------------------------------------
EXECUTIVE DECISION ENGINE & DYNAMIC RECOMMENDATIONS (ANALYTICAL WORKFLOWS ONLY)
--------------------------------------------------
Every strategic report or analytical response MUST end with the following tags containing the EXECUTIVE DECISION ENGINE fields. EVERY metric must include a dynamic reasoning ("Reason: <CFO description explaining WHY>"). NEVER reuse generic recommendations. They must be tailored specifically to the exact customer, supplier, transaction, or material being discussed. You MUST use "Critical", "Needs Attention", "Healthy", "Stable", "Excellent" ratings.
Note: DO NOT generate these tags for simple operational documents (quotation, invoice, purchase order drafts) unless the user explicitly asks for analytical insights.

Format:
[RECOMMENDATION_START]
- Executive Summary: <Summarize the business status. Reason: Detailed financial explanation.>
- Business Impact: <What is the overall strategic/financial impact. Reason: Detailed financial explanation.>
- Priority: <Critical or Needs Attention or Healthy or Stable or Excellent. Reason: Detailed explanation.>
- Business Risk: <Critical or Needs Attention or Healthy or Stable or Excellent. Reason: Detailed explanation.>
- AI Confidence: <Percentage from 95% to 100%. Reason: Analytical explanation.>
- Financial Impact: <Specific numeric impact or value, e.g. ₹1,45,730. Reason: Financial rationale.>
- Estimated Savings: <Specific saved or optimized amount, e.g. ₹18,500. Reason: Rationale.>
- Reason: <The exact strategic reason why this is happening. Reason: Detailed explanation.>
- Recommended Action: <A direct, high-value, specific action for the owner. Reason: Analytical explanation.>
- Inventory Level: <Critical or Needs Attention or Healthy or Stable or Excellent. Reason: Storage/stock explanation.>
- Suggested Action: <Concrete operation. Reason: Operational explanation.>
- Next Best Action: <Automated follow-up recommendation. Reason: Rationale.>
- Cost Optimization: <How costs are optimized. Reason: Material explanation.>
- Market Insight: <A market trend or pricing projection. Reason: Market rationale.>
[RECOMMENDATION_END]

--------------------------------------------------
BUSINESS SIMULATION MODE (CRITICAL REQUIREMENT)
--------------------------------------------------
If the user asks "What happens if..." or "What if..." (e.g., cement prices increase, sales drop, inventory doubles, supplier delays delivery, or any other financial scenario), you MUST perform a thorough financial simulation.
Format the output using the [SIMULATION_START] and [SIMULATION_END] tags. Every metric must explain WHY. Use "Critical", "Needs Attention", "Healthy", "Stable", "Excellent" ratings.

Simulation Format:
[SIMULATION_START]
- Scenario: <Describe the user's simulation scenario.>
- Profit Impact: <Simulate profit change. Reason: Financial explanation.>
- Inventory Impact: <Simulate inventory levels. Reason: Storage explanation.>
- Cash Flow Impact: <Simulate cash flow speed/levels. Reason: Liquidity explanation.>
- Business Risk: <Critical or Needs Attention or Healthy or Stable or Excellent. Reason: Strategic explanation.>
- Recommended Strategy: <SME strategic playbook response. Reason: Operational explanation.>
[SIMULATION_END]
`;

export type AgentType = 'Sales Assistant' | 'Billing Assistant' | 'Inventory Manager' | 'Procurement Advisor' | 'CFO Advisor' | 'Analytics Engine';

export function classifyIntent(prompt: string): AgentType {
  const p = prompt.toLowerCase();
  
  // 1. CFO Advisor Triggers (explicit analytical/strategic questions)
  if (
    p.includes('analyze profit') || p.includes('improve margin') || p.includes('business report') ||
    p.includes('financial health') || p.includes('cash flow') || p.includes('cashflow') ||
    p.includes('growth analysis') || p.includes('cost optimization') || p.includes('receivable analysis') ||
    p.includes('working capital') || p.includes('expense optimization') || p.includes('analyze my profit') ||
    p.includes('analyze the profit') || p.includes('analyze my business') || p.includes('simulate') ||
    p.includes('what happens if') || p.includes('what if')
  ) {
    return 'CFO Advisor';
  }

  // 2. Analytics Engine Triggers (reporting, charts, trends)
  if (
    p.includes('chart') || p.includes('trend') || p.includes('top customer') ||
    p.includes('seasonality') || p.includes('demand forecasting') || p.includes('dashboard') ||
    p.includes('explain dashboard') || p.includes('kpi') || p.includes('intelligence') ||
    p.includes('sales trend') || p.includes('revenue chart') || p.includes('predict') ||
    p.includes('forecasting') || p.includes('prediction') || p.includes('sales dynamics')
  ) {
    return 'Analytics Engine';
  }

  // 3. Billing Assistant (Invoices, billing, payment records)
  if (
    p.includes('invoice') || p.includes('bill') || p.includes('gst summary') ||
    p.includes('e-invoice') || p.includes('tax invoice') || p.includes('payment record') ||
    p.includes('convert quotation') || p.includes('convert quote') || p.includes('billing')
  ) {
    return 'Billing Assistant';
  }

  // 4. Procurement Advisor (PO creation, supplier pricing comparisons, replenishment)
  if (
    p.includes('purchase order') || p.includes('po') || p.includes('reorder') ||
    p.includes('supplier price') || p.includes('compare price') || p.includes('lead time') ||
    p.includes('stock-out') || p.includes('stockout') || p.includes('procurement') ||
    p.includes('replenish') || p.includes('restock')
  ) {
    return 'Procurement Advisor';
  }

  // 5. Inventory Manager (Stock levels, physical operations, warehouding)
  if (
    p.includes('inventory') || p.includes('stock') || p.includes('warehouse') ||
    p.includes('sku') || p.includes('import supplier') || p.includes('adjust stock') ||
    p.includes('adjustments') || p.includes('incoming') || p.includes('receive') ||
    p.includes('movement')
  ) {
    return 'Inventory Manager';
  }

  // Default is Sales Assistant (deals with quotations, client pricing, etc.)
  return 'Sales Assistant';
}

export const AGENT_SYSTEM_PROMPTS: Record<AgentType, string> = {
  'Sales Assistant': `
ROLE: Sales & Quotation Agent
RESPONSIBILITIES: Generate quotations, modify quotations, reuse previous quotation, ask for missing products, suggest products from purchase history, suggest products from uploaded BOQ, generate customer pricing, recommend discounts, generate final quotation PDF.
CRITICAL OPERATIONAL RULES:
- NEVER generate: "Executive Summary", "Business Impact", "Financial Analysis", "Market Insight", "Long reports", "AI Confidence Score", or any C-suite recommendation tags.
- NEVER append standard [RECOMMENDATION_START] ... [RECOMMENDATION_END] tags.
- Keep your output highly concise, brief, conversational, and workflow-driven (Max 150-250 words).
- If the user says "Generate quotation for Verma Construction" (or another existing customer) but does NOT specify products or quantities:
  Perform a history lookup and respond with EXACTLY this structure and options:
  "I found previous purchase history for Verma Construction.
  
  Frequently Purchased Products:
  • Portland Cement Grade 43
  • Premium Teak Plywood
  • TMT Steel Reinforcement Bars
  
  What would you like to do?
  
  1. Reuse previous quotation
  2. Modify previous quotation
  3. Create a new quotation
  4. Upload a BOQ"
  Wait for the user to make a choice before writing any document.
`,
  'Billing Assistant': `
ROLE: Invoice & Billing Agent
RESPONSIBILITIES: Generate invoices, convert quotation to invoice, record payment, calculate GST, generate GST summary, generate e-invoice, export PDF.
CRITICAL OPERATIONAL RULES:
- Focus purely on tax invoice creation and transaction billing.
- NEVER generate business analysis, executive reports, financial optimization insights, market trends, or [RECOMMENDATION_START] ... [RECOMMENDATION_END] tags.
- Keep your responses extremely clean, fast, action-oriented, and brief (Max 150-250 words).
`,
  'Inventory Manager': `
ROLE: Inventory & Warehouse Agent
RESPONSIBILITIES: Import supplier invoice, extract products, match inventory, create new SKU, merge existing SKU, increase stock, receive Purchase Order, track warehouse movement, restock suggestions, supplier matching, stock adjustments.
CRITICAL OPERATIONAL RULES:
- Focus strictly on warehouse, stock, SKU, and physical logistics operations.
- Do NOT talk about strategic market forecasts, business financial health, profitability, or customer margins.
- Do NOT output [RECOMMENDATION_START] ... [RECOMMENDATION_END] tags.
- Keep your response brief, precise, operational, and focused on inventory ledger updates (Max 150-250 words).
`,
  'Procurement Advisor': `
ROLE: Procurement Agent
RESPONSIBILITIES: Generate Purchase Orders (PO), suggest suppliers, compare supplier prices, recommend reorder quantities, predict stock-outs, lead time analysis.
CRITICAL OPERATIONAL RULES:
- Focus on material sourcing, purchase order generation, supplier cost comparisons, and stocking thresholds.
- Do NOT include general customer sales trends, customer receivable reports, or general CFO long reports.
- DO NOT output [RECOMMENDATION_START] ... [RECOMMENDATION_END] tags.
- Keep responses concise, direct, and operational (Max 150-250 words).
`,
  'CFO Advisor': `
ROLE: CFO Advisor
RESPONSIBILITIES: Analyze profit, improve margins, business reports, financial health, cash flow, growth analysis, cost optimization, receivable analysis, revenue forecasting, expense optimization, working capital.
CRITICAL STRATEGIC RULES:
- You are a strategic CFO adviser. You are expected to produce comprehensive reports, calculated metrics, detailed reasoning, forecasts, and strategic plans.
- You MUST append the standard [RECOMMENDATION_START] ... [RECOMMENDATION_END] tags with custom reasoning explaining WHY for each metric.
- Your output can be extensive, detailed, and highly analytical, including professional financial summaries.
`,
  'Analytics Engine': `
ROLE: Analytics Agent
RESPONSIBILITIES: Dashboard explanation, sales trends, top customers, revenue charts, seasonality, demand forecasting, KPIs, business intelligence.
CRITICAL ANALYTICAL RULES:
- Explain enterprise charts, sales velocities, and customer demographics.
- Do NOT generate physical warehouse stock adjustments, tax billing forms, or supplier POs.
- Keep your output professional, analytical, and highly tailored to explaining data and trend diagnostics.
`
};

export function extractContextMemory(history: any[]): string {
  let lastDocType = "";
  let lastParty = "";
  let lastProduct = "";
  let lastQty = 0;
  let lastDocNum = "";
  let lastDocStatus = "";

  for (let i = history.length - 1; i >= 0; i--) {
    const h = history[i];
    const content = h.content || "";
    if (content.includes('[DOC_TYPE]')) {
      const docTypeMatch = content.match(/\[DOC_TYPE\]\s*(\w+)/);
      if (docTypeMatch) lastDocType = docTypeMatch[1];
      
      const docNumMatch = content.match(/\[DOC_NUM\]\s*([^\n]+)/);
      if (docNumMatch) lastDocNum = docNumMatch[1].trim();

      const docStatusMatch = content.match(/\[DOC_STATUS\]\s*([^\n]+)/);
      if (docStatusMatch) lastDocStatus = docStatusMatch[1].trim();

      const docPartyMatch = content.match(/\[DOC_PARTY\]\s*([^\n]+)/);
      if (docPartyMatch) lastParty = docPartyMatch[1].trim();
      
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.includes('|') && !line.includes('HSN') && !line.includes('---') && !line.includes('Code')) {
          const parts = line.split('|').map((x: string) => x.trim()).filter(Boolean);
          if (parts.length >= 3) {
            if (parts.length >= 4) {
              lastProduct = parts[1];
              const parsedQty = parseInt(parts[3], 10);
              if (!isNaN(parsedQty)) lastQty = parsedQty;
            } else {
              lastProduct = parts[0];
              const parsedQty = parseInt(parts[2], 10);
              if (!isNaN(parsedQty)) lastQty = parsedQty;
            }
          }
        }
      }
      break;
    }
  }

  let extraMemory = "";
  try {
    const lastInvoiceStr = typeof window !== 'undefined' ? window.localStorage.getItem("bizpilot_last_invoice") : null;
    const lastPoStr = typeof window !== 'undefined' ? window.localStorage.getItem("bizpilot_last_po") : null;
    const lastQuotationStr = typeof window !== 'undefined' ? window.localStorage.getItem("bizpilot_last_quotation") : null;
    const inventoryCtxStr = typeof window !== 'undefined' ? window.localStorage.getItem("bizpilot_inventory_context") : null;
    const supplierCtxStr = typeof window !== 'undefined' ? window.localStorage.getItem("bizpilot_supplier_context") : null;
    const customerCtxStr = typeof window !== 'undefined' ? window.localStorage.getItem("bizpilot_customer_context") : null;

    if (lastInvoiceStr) extraMemory += `\n- Last Extracted Supplier Invoice: ${lastInvoiceStr}`;
    if (lastPoStr) extraMemory += `\n- Last Supplier Purchase Order: ${lastPoStr}`;
    if (lastQuotationStr) extraMemory += `\n- Last Customer Sales Quotation: ${lastQuotationStr}`;
    if (inventoryCtxStr) extraMemory += `\n- Real-Time Inventory Health Context: ${inventoryCtxStr}`;
    if (supplierCtxStr) extraMemory += `\n- Real-Time Supplier Ledger Context: ${supplierCtxStr}`;
    if (customerCtxStr) extraMemory += `\n- Real-Time Customer Outstanding Context: ${customerCtxStr}`;
  } catch (e) {
    console.warn("Storage context fetch bypassed.", e);
  }

  if (lastDocType || extraMemory) {
    return `
[SYSTEM MEMORY ADVISORY: The user is currently editing or referencing the following ERP transaction context:
${lastDocType ? `- Last Active Chat Document Type: ${lastDocType}
- Document ID: ${lastDocNum}
- Status: ${lastDocStatus}
- Party Name: ${lastParty}
- Material/Product: ${lastProduct}
- Current Quantity: ${lastQty}` : ''}
${extraMemory}
If the user references the invoice, the purchase order, or general inventory context, incorporate these live numbers and context details directly into your strategic recommendation or document draft.]`;
  }
  return "";
}

// Smart local fallback responses if API is down/unset
export function generateSmartMockResponse(prompt: string, history: any[] = []): string {
  const p = prompt.toLowerCase();
  
  // Smart Business Memory: Scan history backwards to find previous context
  let lastDocType = "";
  let lastParty = "";
  let lastProduct = "";
  let lastQty = 50;
  let lastDocNum = "";

  for (let i = history.length - 1; i >= 0; i--) {
    const h = history[i];
    if (h.sender === 'assistant' && h.content.includes('[DOC_TYPE]')) {
      const docTypeMatch = h.content.match(/\[DOC_TYPE\]\s*(\w+)/);
      if (docTypeMatch) lastDocType = docTypeMatch[1];
      
      const docNumMatch = h.content.match(/\[DOC_NUM\]\s*([^\n]+)/);
      if (docNumMatch) lastDocNum = docNumMatch[1].trim();

      const docPartyMatch = h.content.match(/\[DOC_PARTY\]\s*([^\n]+)/);
      if (docPartyMatch) lastParty = docPartyMatch[1].trim();
      
      const lines = h.content.split('\n');
      for (const line of lines) {
        if (line.includes('|') && !line.includes('HSN') && !line.includes('---') && !line.includes('Code')) {
          const parts = line.split('|').map(x => x.trim()).filter(Boolean);
          if (parts.length >= 3) {
            if (parts.length >= 4) {
              lastProduct = parts[1];
              const parsedQty = parseInt(parts[3], 10);
              if (!isNaN(parsedQty)) lastQty = parsedQty;
            } else if (parts.length >= 3) {
              lastProduct = parts[0];
              const parsedQty = parseInt(parts[2], 10);
              if (!isNaN(parsedQty)) lastQty = parsedQty;
            }
          }
        }
      }
      break;
    }
  }

  // Handle Simulation Mode
  const isSimulationReq = p.includes('what happens') || p.includes('what if') || p.includes('simulate') || p.includes('prices increase') || p.includes('sales drop') || p.includes('inventory double') || p.includes('delay');
  if (isSimulationReq) {
    if (p.includes('cement') || p.includes('cement prices') || p.includes('15%')) {
      return `### **BIZPILOT COGNITIVE BUSINESS SIMULATION RESULT**

We have run a 10,000-iteration Monte Carlo sensitivity analysis for **Apex Builders Supply & Paints** regarding the proposed **15% Cement Price Hike** (Portland Cement Grade 43 from ₹450 to ₹517.50 per bag).

[SIMULATION_START]
- Scenario: Portland Cement prices increase by 15% due to regulatory supply constraints in Northern India.
- Profit Impact: Gross profit margins on cement drop by **4.2%** (loss of ₹13,500/month) if costs are absorbed. Reason: Cement is our highest volume driver (450 bags sold/month), so cost hikes quickly compress our 28% margin spread.
- Inventory Impact: Stable but high pressure. Safety stock remains at 450 bags. Reason: Builders will pre-buy, increasing stock turn velocity by 22% in the first 7 days to dodge the price increase.
- Cash Flow Impact: Cash outflow for procurement expands by **₹48,000/month**. Reason: Sourcing cement from UltraTech Cement Ltd will require immediate cash reserves, shortening our working capital buffer.
- Business Risk: Needs Attention. Reason: Intense price sensitivity in commercial construction tenders in Delhi NCR. Passing the entire 15% to Verma Construction may cause them to seek secondary suppliers.
- Recommended Strategy: Raise retail/counter pricing by **9.5%** immediately and lock in a **60-day price-shield contract** for 1000 bags with UltraTech Cement Ltd. Reason: Absorbing 5.5% represents a strategic trade-off that maintains builder loyalty while minimizing margin contraction to only 1.2%.
[SIMULATION_END]`;
    }

    if (p.includes('sales drop') || p.includes('drop by 20') || p.includes('sales decline')) {
      return `### **BIZPILOT COGNITIVE BUSINESS SIMULATION RESULT**

We have analyzed a stress-test scenario representing a **20% decline in Q3 regional builder dispatch sales**.

[SIMULATION_START]
- Scenario: High-volume builder dispatch sales drop by 20% due to infrastructure funding delays.
- Profit Impact: Net monthly profit drops from ₹6.05 Lakh to ₹4.84 Lakh (loss of **₹1,21,000**). Reason: High operational leverage of Apex Builders means fixed warehouse overheads weigh heavier as revenue contracts.
- Inventory Impact: Inventory holding levels inflate by **25%** across Steel and Plywood. Reason: Committed incoming shipments from Tata Steel Corp will accumulate in our primary warehouse, slowing inventory turns from 8x to 5.5x.
- Cash Flow Impact: Working capital declines by **₹2,40,000**. Reason: Cash is trapped in slow-moving stock, necessitating a ₹1.5 Lakh short-term bank credit line utilization.
- Business Risk: Critical. Reason: Debt recovery from Sharma Traders (₹1,33,000 overdue) combined with deferred revenue poses serious short-term solvency challenges.
- Recommended Strategy: Initiate a high-margin accessory promotion (e.g. Paint + premium brushes), freeze TMT Steel bulk pre-orders, and offer Sharma Traders a **1% early payment settlement discount**. Reason: Unlocking trapped capital is cheaper and faster than short-term bank credit lines.
[SIMULATION_END]`;
    }

    if (p.includes('inventory double') || p.includes('double') || p.includes('inventory increases')) {
      return `### **BIZPILOT COGNITIVE BUSINESS SIMULATION RESULT**

We have simulated the financial impact of **doubling our active inventory holding across all product lines**.

[SIMULATION_START]
- Scenario: Active inventory levels double (from ₹8.2 Lakhs valuation to ₹16.4 Lakhs).
- Profit Impact: Storage and insurance overheads rise by **₹8,500/month**, compressing net margins by **0.8%**. Reason: Storing extra paint tubs and plywood sheets requires secondary local warehouse leasing.
- Inventory Impact: Double buffer stock shields Apex against monsoon supply-chain bottlenecks. Reason: Avoids stockout risks of UltraShield Paint and river sand completely, ensuring 100% order fulfillment.
- Cash Flow Impact: Trapped working capital increases by **₹3,80,000**. Reason: Free cash reserves are fully deployed into physical materials, reducing liquid cash ratios below 1.1x.
- Business Risk: Needs Attention. Reason: High exposure to price corrections in commodity steel and moisture-sensitive plywood rotting in monsoon humidity.
- Recommended Strategy: Establish a "Summer Supply Clearing Campaign", bundle slow accessories, and require **50% advance deposits** for all bulk orders. Reason: Generating advance deposits offsets the cash-outflow pressure from inflated holding stocks.
[SIMULATION_END]`;
    }

    if (p.includes('delay') || p.includes('supplier delays') || p.includes('lead time')) {
      return `### **BIZPILOT COGNITIVE BUSINESS SIMULATION RESULT**

We have simulated a **14-day supply chain transit delay** from primary manufacturers (UltraTech Cement & GreenPly).

[SIMULATION_START]
- Scenario: Monsoon-related logistics blockades trigger a 14-day delivery delay from primary suppliers.
- Profit Impact: Net monthly margins are compressed by **2.4%** due to lost sales, deferring **₹2,10,000** in revenue. Reason: Delayed deliveries mean customers cancel and source locally to keep projects moving.
- Inventory Impact: Critical stockouts of UltraShield Paint (currently 5 tubs) and Teak Plywood (4 sheets) within 4 days. Reason: Current stock levels are already below safe buffer thresholds.
- Cash Flow Impact: Delayed invoicing pushes cash inflows out by **25 days**, squeezing monthly operational cash. Reason: We cannot invoice clients until project deliveries are verified.
- Business Risk: Critical. Reason: Elite Builders & Architects will divert their ₹5.3L materials pipeline to local competitors if we fail to dispatch.
- Recommended Strategy: Immediately source **50 tubs of wall paint** from local secondary distributors, and notify Elite Builders of dynamic logistics scheduling. Reason: Local sourcing preserves our builder accounts and revenue, despite paying a minor 3% localized premium.
[SIMULATION_END]`;
    }

    // Generic fallback simulation
    return `### **BIZPILOT COGNITIVE BUSINESS SIMULATION RESULT**

[SIMULATION_START]
- Scenario: Dynamic macro-economic simulation for: ${prompt}.
- Profit Impact: Adjusted margin profile +/-1.5%. Reason: Higher procurement costs are balanced by stable retail pricing.
- Inventory Impact: Safety buffers remain active. Reason: Inventory is protected by our pre-determined reorder rules.
- Cash Flow Impact: Operating cash flow remains stable. Reason: Active collection procedures mitigate cash drains.
- Business Risk: Excellent. Reason: Balanced diversified material list shields us against single product drops.
- Recommended Strategy: Enforce strict minimum stock thresholds and lock supply-side contract rates immediately. Reason: Safeguards cash flow and maintains healthy operational liquidity.
[SIMULATION_END]`;
  }

  // Handle Quantity adjustments (AI Memory)
  const isQuantityAdjustment = p.includes('increase') || p.includes('decrease') || p.includes('change') || p.includes('quantity') || p.includes('qty') || p.includes('set quantity') || p.includes('to ');
  
  if (isQuantityAdjustment && lastDocType) {
    const qtyMatch = prompt.match(/(?:to|quantity|qty|increase|change|set|to\s+)\s*(\d+)/i) || prompt.match(/(\d+)\s*(?:sheets|bags|tubs|units|pcs|items)/i);
    let newQty = lastQty;
    if (qtyMatch) {
      newQty = parseInt(qtyMatch[1], 10);
    } else if (p.includes('double')) {
      newQty = lastQty * 2;
    }

    if (lastDocType === 'PURCHASE_ORDER') {
      const supplier = lastParty || "GreenPly Industries Ltd.";
      const product = lastProduct || "Premium Teak Plywood (8x4 ft, 18mm)";
      const itemPrice = 2400;
      const subtotal = newQty * itemPrice;
      const freight = 3500;
      const gst = Math.round((subtotal + freight) * 0.18);
      const grandTotal = subtotal + freight + gst;

      return `[SUCCESS_MSG] Purchase Order updated successfully with quantity adjusted to ${newQty}.
[DOC_TYPE] PURCHASE_ORDER
[DOC_NUM] ${lastDocNum || 'PO-2026-884'}
[DOC_DATE] ${new Date().toISOString().split('T')[0]}
[DOC_STATUS] CONFIRMED
[DOC_PARTY] ${supplier}
[DOC_PREPARED_BY] BizPilot AI
[DOC_ITEMS]
| Code | Item Description | Unit | Qty | Rate | Total |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **4412** | **${product}** | Sheets | ${newQty} | ₹${itemPrice.toLocaleString('en-IN')}.00 | ₹${subtotal.toLocaleString('en-IN')}.00 |
[DOC_FINANCIALS]
- Material Subtotal: ₹${subtotal.toLocaleString('en-IN')}.00
- Estimated Logistic Freight: ₹${freight.toLocaleString('en-IN')}.00
- Taxable Value: ₹${(subtotal + freight).toLocaleString('en-IN')}.00
- Integrated GST (18%): ₹${gst.toLocaleString('en-IN')}.00
- Estimated Grand Total: ₹${grandTotal.toLocaleString('en-IN')}.00
[DOC_TERMS]
1. Please confirm order receipt and estimate dispatch timeline within 24 hours.
2. Deliveries must be accompanied by a valid e-Way Bill to the Apex Main Warehouse.
3. Payment will be released under standard Net-30 terms upon verification of receiving inspection.
[DOC_END]`;
    }

    if (lastDocType === 'QUOTATION' || lastDocType === 'INVOICE') {
      const customer = lastParty || "Verma Construction";
      const product = lastProduct || "Premium Teak Plywood (8x4 ft)";
      const itemPrice = 2400;
      const subtotal = newQty * itemPrice;
      const discount = Math.round(subtotal * 0.05);
      const taxable = subtotal - discount;
      const gst = Math.round(taxable * 0.18);
      const grandTotal = taxable + gst;

      return `[SUCCESS_MSG] Quotation updated successfully with quantity adjusted to ${newQty}.
[DOC_TYPE] QUOTATION
[DOC_NUM] ${lastDocNum || 'QT-2026-092'}
[DOC_DATE] ${new Date().toISOString().split('T')[0]}
[DOC_STATUS] APPROVED
[DOC_PARTY] ${customer}
[DOC_PREPARED_BY] BizPilot AI
[DOC_ITEMS]
| Code | Item Description | Unit | Qty | Rate | Total |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **4412** | **${product}** | Sheets | ${newQty} | ₹${itemPrice.toLocaleString('en-IN')}.00 | ₹${subtotal.toLocaleString('en-IN')}.00 |
[DOC_FINANCIALS]
- Gross Subtotal: ₹${subtotal.toLocaleString('en-IN')}.00
- Volume Discount Applied (5%): -₹${discount.toLocaleString('en-IN')}.00
- Taxable Amount: ₹${taxable.toLocaleString('en-IN')}.00
- GST (18%): ₹${gst.toLocaleString('en-IN')}.00
- Grand Total (Inc. GST): ₹${grandTotal.toLocaleString('en-IN')}.00
[DOC_TERMS]
1. Delivery within 3 business days of confirmation with a valid e-Way Bill.
2. 50% advance, balance on delivery.
3. Pricing locked for 14 days.
[DOC_END]`;
    }
  }

  // Email request or forward request for previous document
  if ((p.includes('email') || p.includes('send') || p.includes('mail') || p.includes('forward')) && lastDocType) {
    const partyName = lastParty || "the customer";
    return `✅ Task Completed Successfully: Email draft created for ${partyName}.

### **AI-GENERATED DISPATCH EMAIL**

**Subject:** Quotation / Order Details Summary - Apex Builders Supply & Paints  
**To:** contacts@${partyName.toLowerCase().replace(/\s+/g, '')}.com  
**Cc:** records@apexbuilders.com  

Dear ${partyName} Team,

We have prepared and updated the requested business document as discussed:

- **Document Reference:** ${lastDocNum || (lastDocType === 'PURCHASE_ORDER' ? 'PO-2026-884' : 'QT-2026-092')}
- **Item Details:** ${lastProduct || 'Materials'} (Quantity: ${lastQty})
- **Date:** ${new Date().toISOString().split('T')[0]}

Please find the details inside your BizPilot dashboard. If you need any further adjustments, feel free to reply directly to this thread.

Sincerely,  
**Finance & Procurement Team**  
*Apex Builders Supply & Paints*  
*Powered by BizPilot AI*`;
  }

  // Dynamic Purchase / Restock Order fallback
  if (p.includes('restock') || p.includes('purchase order') || p.includes('po') || p.includes('order')) {
    let supplier = "GreenPly Industries Ltd.";
    if (p.includes('steel') || p.includes('tata')) supplier = "Tata Steel Corp.";
    else if (p.includes('cement') || p.includes('ultratech')) supplier = "UltraTech Cement Ltd.";
    else if (p.includes('paint') || p.includes('chemical')) supplier = "Apex Chemical Industries";
    
    let product = "Premium Teak Plywood (8x4 ft, 18mm)";
    if (p.includes('steel') || p.includes('bar')) product = "TMT Steel Reinforcement Bars (12mm)";
    else if (p.includes('cement')) product = "Portland Cement Grade 43 (50kg Bag)";
    else if (p.includes('paint')) product = "UltraShield Premium Wall Paint (20L)";
    else if (p.includes('brick')) product = "Clay Red Bricks (Pack of 1000)";
    
    // Attempt custom extraction if user typed something specific
    const toMatch = prompt.match(/to\s+([A-Za-z0-9\s&]+?)(?=\s+for|\s+to|\s+with|\s+at|$)/i);
    if (toMatch && toMatch[1]) {
      supplier = toMatch[1].trim();
    }
    const forMatch = prompt.match(/for\s+([A-Za-z0-9\s()×x\-.,]+?)(?=\s+to|\s+with|\s+at|$)/i);
    if (forMatch && forMatch[1]) {
      product = forMatch[1].trim();
    }

    return `[SUCCESS_MSG] Purchase Order generated successfully for ${supplier}.
[DOC_TYPE] PURCHASE_ORDER
[DOC_NUM] PO-2026-884
[DOC_DATE] ${new Date().toISOString().split('T')[0]}
[DOC_STATUS] CONFIRMED
[DOC_PARTY] ${supplier}
[DOC_PREPARED_BY] BizPilot AI
[DOC_ITEMS]
| Code | Item Description | Unit | Qty | Rate | Total |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **4412** | **${product}** | Units | 50 | ₹2,400.00 | ₹1,20,000.00 |
[DOC_FINANCIALS]
- Material Subtotal: ₹1,20,000.00
- Estimated Logistic Freight: ₹3,500.00
- Taxable Value: ₹1,23,500.00
- Integrated GST (18%): ₹22,230.00
- Estimated Grand Total: ₹1,45,730.00
[DOC_TERMS]
1. Please confirm order receipt and estimate dispatch timeline within 24 hours.
2. Deliveries must be accompanied by a valid e-Way Bill to the Apex Main Warehouse.
3. Payment will be released under standard Net-30 terms upon verification of receiving inspection.
[DOC_END]`;
  }

  if (p.includes('quotation') || p.includes('quote')) {
    let customer = "Verma Construction";
    if (p.includes('sharma')) customer = "Sharma Traders";
    else if (p.includes('elite')) customer = "Elite Builders & Architects";
    else if (p.includes('gupta')) customer = "Gupta & Sons Ltd";
    else if (p.includes('royal')) customer = "Royal Paints Decor";

    // Check if user specified products, or asked to reuse/modify history, or if there are explicit items mentioned
    const mentionsProducts = p.includes('cement') || p.includes('plywood') || p.includes('paint') || p.includes('steel') || p.includes('brick') || p.includes('primer') || p.includes('screws') || p.includes('brush') || p.includes('bag') || p.includes('sheet') || p.includes('tub') || p.includes('can') || p.includes('unit') || p.includes('reuse') || p.includes('yes') || p.includes('confirm') || p.includes('apply');

    if (!mentionsProducts) {
      // Priority 3: Previous history exists for specific customers
      if (customer === 'Verma Construction' || customer === 'Sharma Traders' || customer === 'Elite Builders & Architects' || customer === 'Gupta & Sons Ltd') {
        return `I found previous purchase history for ${customer}.

Frequently Purchased Products:
• Portland Cement Grade 43
• Premium Teak Plywood
• TMT Steel Reinforcement Bars

What would you like to do?

1. Reuse previous quotation
2. Modify previous quotation
3. Create a new quotation
4. Upload a BOQ`;
      } else {
        // Priority 4: No history exists (e.g. Royal Paints Decor or other new customer), ask for missing info
        return `### **ERP AI Missing Information Directive (Priority 4)**

I am ready to generate a professional valuation estimate for **${customer}**. However, **no product specifications, quantities, or historical order logs** could be found for this buyer inside the Customer Master.

To maintain high-fidelity corporate compliance and avoid draft hallucinations, I cannot auto-generate a quotation without a legitimate business source.

Please proceed with one of the following options:
1. **Provide a detailed product list** (e.g., *"Generate quotation for Royal Paints: 50 tubs UltraShield Premium Paint (20L), 15 cans Industrial Wood Primer (5L)"*)
2. **Upload a BOQ / Tender spreadsheet** (PDF, Excel, or CSV) for automated material extraction
3. **Search products in our ERP warehouse** and build the quotation interactively in our **Quotation Gen** tab.`;
      }
    }

    // If we reach here, we have products or an approval to generate the quotation (Priority 1 or 2 or 3 Confirmation)
    let product1 = "Portland Cement Grade 43 (50kg Bag)";
    let qty1 = 200;
    let rate1 = 450;
    
    let product2 = "TMT Steel Reinforcement Bars (12mm)";
    let qty2 = 5;
    let rate2 = 52000;

    let product3 = "Premium Teak Plywood (8x4 ft)";
    let qty3 = 10;
    let rate3 = 2400;

    // Adapt based on keywords in prompt
    if (p.includes('paint') || p.includes('ultrashield')) {
      product1 = "UltraShield Premium Wall Paint (20L)";
      qty1 = 20;
      rate1 = 3800;
      product2 = "Industrial Wood Primer (5L)";
      qty2 = 10;
      rate2 = 950;
      product3 = "Heavy Duty Brush Set (Pack of 5)";
      qty3 = 15;
      rate3 = 350;
    } else if (p.includes('plywood') || p.includes('teak')) {
      product1 = "Premium Teak Plywood (8x4 ft, 18mm)";
      qty1 = 15;
      rate1 = 2400;
      product2 = "Universal Screws Box (1000 Pcs)";
      qty2 = 20;
      rate2 = 180;
      product3 = "Heavy Duty Brush Set (Pack of 5)";
      qty3 = 5;
      rate3 = 350;
    }

    // If explicit quantities are in prompt
    const cementMatch = prompt.match(/(\d+)\s*bags?\s*(?:of\s*)?(?:cement|portland)/i);
    if (cementMatch) { qty1 = parseInt(cementMatch[1]); }
    const steelMatch = prompt.match(/(\d+)\s*(?:bundles?|tons?)\s*(?:of\s*)?(?:steel|tmt)/i);
    if (steelMatch) { qty2 = parseInt(steelMatch[1]); }
    const plyMatch = prompt.match(/(\d+)\s*(?:sheets?|plys?)\s*(?:of\s*)?(?:plywood|teak)/i);
    if (plyMatch) { qty3 = parseInt(plyMatch[1]); }

    const subtotal = (qty1 * rate1) + (qty2 * rate2) + (qty3 * rate3);
    const discount = Math.round(subtotal * 0.05);
    const taxable = subtotal - discount;
    const gst = Math.round(taxable * 0.18);
    const grandTotal = taxable + gst;

    return `[SUCCESS_MSG] Quotation generated successfully for ${customer}.
[DOC_TYPE] QUOTATION
[DOC_NUM] QT-2026-092
[DOC_DATE] ${new Date().toISOString().split('T')[0]}
[DOC_STATUS] APPROVED
[DOC_PARTY] ${customer}
[DOC_PREPARED_BY] BizPilot AI
[DOC_ITEMS]
| Code | Item Description | Unit | Qty | Rate | Total |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2523** | **${product1}** | Bags | ${qty1} | ₹${rate1.toLocaleString('en-IN')}.00 | ₹${(qty1 * rate1).toLocaleString('en-IN')}.00 |
| **7214** | **${product2}** | Bundles | ${qty2} | ₹${rate2.toLocaleString('en-IN')}.00 | ₹${(qty2 * rate2).toLocaleString('en-IN')}.00 |
| **4412** | **${product3}** | Sheets | ${qty3} | ₹${rate3.toLocaleString('en-IN')}.00 | ₹${(qty3 * rate3).toLocaleString('en-IN')}.00 |
[DOC_FINANCIALS]
- Gross Subtotal: ₹${subtotal.toLocaleString('en-IN')}.00
- Volume Discount Applied (5%): -₹${discount.toLocaleString('en-IN')}.00
- Taxable Amount: ₹${taxable.toLocaleString('en-IN')}.00
- GST (18%): ₹${gst.toLocaleString('en-IN')}.00
- Grand Total (Inc. GST): ₹${grandTotal.toLocaleString('en-IN')}.00
[DOC_TERMS]
1. Delivery within 3 business days of confirmation with a valid e-Way Bill.
2. 50% advance, balance on delivery.
3. Pricing locked for 14 days.
[DOC_END]`;
  }

  if (p.includes('invoice') || p.includes('bill') || p.includes('gst')) {
    let customer = "Sharma Traders";
    if (p.includes('verma')) customer = "Verma Construction";
    else if (p.includes('elite')) customer = "Elite Builders & Architects";

    return `[SUCCESS_MSG] Tax Invoice generated successfully for ${customer}.
[DOC_TYPE] INVOICE
[DOC_NUM] INV-2026-408
[DOC_DATE] ${new Date().toISOString().split('T')[0]}
[DOC_STATUS] URGENT
[DOC_PARTY] ${customer}
[DOC_PREPARED_BY] BizPilot AI
[DOC_ITEMS]
| Code | Item Description | Unit | Qty | Rate | Total |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 3209 | UltraShield Premium Wall Paint (20L) | Tub | 30 | ₹3,800.00 | ₹1,14,000.00 |
| 3208 | Industrial Wood Primer (5L) | Can | 20 | ₹950.00 | ₹19,000.00 |
[DOC_FINANCIALS]
- Taxable Value: ₹1,33,000.00
- GST / CGST + SGST (18%): ₹23,940.00
- Invoice Amount: ₹1,56,940.00
- Payments Received: ₹23,940.00
- Balance Due: ₹1,33,000.00
[DOC_TERMS]
1. Payment due immediately under standard overdue notice terms.
2. Late fees of 1.5% per month applicable after grace period of 7 days.
[DOC_END]`;
  }

  if (p.includes('analyze') || p.includes('sales') || p.includes('predict') || p.includes('revenue')) {
    return `### **BIZPILOT FINANCIAL PERFORMANCE & DEMAND FORECAST**

Based on our current H1 2026 sales velocity in India, **Apex Builders Supply & Paints** is showing a robust upward trajectory. Here is the AI CFO diagnostic:

#### **1. Core Financial Trajectory (INR)**
- **Monthly Revenue Growth:** Steady increase from **₹12,50,000** in January to **₹22,15,000** in June (+77.2% cumulative growth).
- **Profitability:** June net margins stabilized at **27.3%** (₹6,05,000 net profit). However, there has been a **3% margin slippage** due to rising steel transport and freight costs.

#### **2. Category Diagnostics**
- **High-Velocity Drivers:** Portland Cement Grade 43 demand is up **28%** MoM due to local infrastructure development.
- **Underperforming Assets:** Fine River Sand is down **5%** due to weather preparation, but impending mining restrictions will cause a supply shock.
- **Stock Alert Warnings:** UltraShield Wall Paint is at a critical **5 tubs left** against a min threshold of 20. Teak Plywood is at **4 sheets left**.

#### **3. Projections for Q3 2026**
- **Predicted July Revenue:** **₹24,50,000** (Expected confidence level: 92%).
- **Key Risks:** Overdue accounts receivable of **₹6,66,000** (primarily Elite Builders at ₹5,33,000 and Sharma Traders at ₹1,33,000) are choking operational liquidity.

#### **Recommended Strategic Moves:**
1. **Capital Infusion:** Immediately place orders for **Plywood (20 sheets)** and **Paint (30 tubs)** to capture seasonal decoration sales.
2. **Receivable Collections:** Dispatch the AI-generated payment notice to Sharma Traders immediately to recover ₹1,33,000.`;
  }

  if (p.includes('email') || p.includes('follow-up') || p.includes('reminder')) {
    return `### **AI-GENERATED FOLLOW-UP EMAIL**

**Subject:** Urgent: Outstanding Balance Review - Apex Builders Supply & Paints

**To:** purchase@sharmatraders.com  
**Cc:** accounts@apexbuilders.com

Dear Sharma Traders Team,

I hope this email finds you well.

This is a friendly reminder that an outstanding balance of **₹1,33,000.00** under invoice **INV-2026-101** remains overdue on your account. The invoice was issued on June 25, 2026, with net-30 payment terms.

To prevent any interruptions in your supply chain shipments of UltraShield Wall Paint and Building Materials, we kindly request that you settle this payment at your earliest convenience.

**Payment Summary:**
- **Outstanding Overdue:** ₹1,33,000.00
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
- **Financial Rationale:** UltraShield Paint has a gross margin of **26%** (₹1,000 profit per tub). Heavy Duty Brushes have a high margin of **37%** but move slowly. Combining them clears accessory stock and increases total paint cart size by 15%.

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
   - *Fix:* Set a minimum order quantity (MOQ) of 5 Bundles for free delivery, or pass a ₹3,500 flat transport fee to the client.

2. **Capitalize on Steel Price Arbitrage**
   - *Action:* Pricing for TMT Steel Bars is forecasted to increase by **4%** next week due to tariff changes. Pre-purchasing **10 bundles** now will lock in lower costs and increase profit spread on sales.

3. **Incentivize Collections to Boost Working Capital**
   - *Action:* Offer a **0.5% early settlement discount** for payments received within 10 days of invoice date (e.g., Elite Builders and Sharma Traders). This is cheaper than commercial short-term loans.

4. **Product Cross-Selling**
   - *Action:* Cross-sell slow-moving, high-margin accessories (Brushes, Universal Screws) during checkout of bulk building materials. Create an automated checkout prompt in the sales dashboard.`;
  }

  // General dynamic response for any other prompt
  return `### **BizPilot CFO Advisory Analysis**

Thank you for your request: *"${prompt}"*.

Based on **Apex Builders Supply & Paints** current H1 2026 operational diagnostics, we have analyzed this request under our business guidelines:

1. **Working Capital Strategy**: Implementing this plan requires healthy cash flow. Resolving the outstanding ₹1,33,000 collection with Sharma Traders and ₹5,33,000 with Elite Builders will release necessary liquidity.
2. **Current Materials Alert**:
   - *UltraShield Paint*: 5 tubs remaining (critically low).
   - *Premium Teak Plywood*: 4 sheets remaining (critically low).
   - *Fine River Sand*: 2 truckloads remaining (monsoon mining bans start next week).
3. **Logistics Optimization**: When coordinating transport or dispatch for this request, ensure we bundle accessories to capture maximum margins.

Please let me know if you would like me to draft formal proposals or finalize invoice templates for this action!`;
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

  // Find memory advice of last document to force model awareness
  const memoryAdvisory = extractContextMemory(history);
  const enhancedPrompt = memoryAdvisory ? `${prompt}\n\n${memoryAdvisory}` : prompt;

  if (!client) {
    console.log("Gemini API key not configured or invalid. Serving local smart mock backup.");
    return generateSmartMockResponse(prompt, history);
  }

  try {
    const agent = classifyIntent(prompt);
    const agentPrompt = AGENT_SYSTEM_PROMPTS[agent];
    const combinedInstruction = `${BUSINESS_CONTEXT}\n\n${agentPrompt}`;

    // Ensure history strictly starts with 'user' and alternates roles to comply with Google Gen AI SDK guidelines
    const formattedHistory: any[] = [];
    let expectedRole = 'user';
    
    for (const msg of (history || [])) {
      const role = msg.sender === 'user' ? 'user' : 'model';
      if (role === expectedRole) {
        formattedHistory.push({
          role: role,
          parts: [{ text: msg.content }]
        });
        expectedRole = expectedRole === 'user' ? 'model' : 'user';
      }
    }

    // Since our new message is of role 'user', if the history ended on a 'user' message
    // (meaning expectedRole is 'model'), we pop the last item of history to avoid consecutive 'user' turns.
    if (expectedRole === 'model' && formattedHistory.length > 0) {
      formattedHistory.pop();
    }

    const contents = [
      ...formattedHistory,
      { role: 'user', parts: [{ text: enhancedPrompt }] }
    ];

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction: combinedInstruction,
        temperature: 0.7,
      },
    });

    return response.text || generateSmartMockResponse(prompt, history);
  } catch (error) {
    console.error("Gemini client-side call failed, falling back:", error);
    return generateSmartMockResponse(prompt, history);
  }
}

function cleanAndParseJSON(text: string): any {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '').trim();
  }
  return JSON.parse(cleaned);
}

/**
 * Fetches automatic dashboard insights on the client side using VITE_GEMINI_API_KEY
 */
export async function getDashboardInsights(): Promise<{ recommendation: string; score: number }> {
  const client = getGeminiClient();

  const fallback = {
    recommendation: 'Reorder UltraShield Premium Paint (20L) and Fine River Sand today. Contact Sharma Traders to collect outstanding ₹1,33,000 payment.',
    score: 84
  };

  if (!client) {
    return fallback;
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'Provide a concise, single-sentence summary recommendation to display on the main dashboard for the CEO of Apex Builders Supply, along with an integer score from 1 to 100 indicating the current health of the business (where 100 is perfect and cash-flow/inventory are pristine). Output strictly as JSON.',
      config: {
        systemInstruction: BUSINESS_CONTEXT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            recommendation: { type: 'STRING' },
            score: { type: 'INTEGER' }
          },
          required: ['recommendation', 'score']
        }
      }
    });

    const parsed = cleanAndParseJSON(response.text || '{}');
    return {
      recommendation: parsed.recommendation || fallback.recommendation,
      score: typeof parsed.score === 'number' ? parsed.score : fallback.score
    };
  } catch (err) {
    console.error("Dashboard insights client-side call failed:", err);
    return fallback;
  }
}
