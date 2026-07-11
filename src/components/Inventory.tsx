import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Filter, ArrowUpDown, Sparkles, AlertTriangle, CheckCircle2,
  TrendingUp, ShoppingBag, Edit, Plus, RefreshCw, Upload, FileSpreadsheet,
  PackageCheck, PackagePlus, Eye, Info, Check, ArrowRight, X, Calendar,
  Database, Download, Loader2, ArrowUpRight, TrendingDown, ClipboardList,
  MapPin, HelpCircle
} from 'lucide-react';
import { Product, InventoryMovement, SupplierLedgerEntry, PurchaseOrder, Supplier } from '../types';
import { formatCurrency } from '../lib/format';

interface InventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  movements: InventoryMovement[];
  setMovements: React.Dispatch<React.SetStateAction<InventoryMovement[]>>;
  supplierLedger: SupplierLedgerEntry[];
  setSupplierLedger: React.Dispatch<React.SetStateAction<SupplierLedgerEntry[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  purchaseOrders: PurchaseOrder[];
  setPurchaseOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
  onRestock: (productId: string, quantity: number) => void;
  onNavigateToCopilot: (initialPrompt?: string) => void;
  currency?: string;
  onAddAuditLog?: (action: string, affectedRecord: string, status: 'SUCCESS' | 'WARNING' | 'FAILED' | 'PENDING' | 'BLOCKED', operator?: string) => void;
}

type SortField = 'name' | 'stock' | 'price' | 'category' | 'warehouseLocation';
type SortOrder = 'asc' | 'desc';
type TabId = 'ledger' | 'procurement' | 'supplier' | 'movements' | 'recommendations';

export default function Inventory({
  products,
  setProducts,
  movements,
  setMovements,
  supplierLedger,
  setSupplierLedger,
  suppliers,
  setSuppliers,
  purchaseOrders,
  setPurchaseOrders,
  onRestock,
  onNavigateToCopilot,
  currency = 'INR',
  onAddAuditLog
}: InventoryProps) {
  // Navigation & View tabs
  const [activeTab, setActiveTab] = useState<TabId>('ledger');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('stock');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Supplier Master specific state variables
  const [supplierSearch, setSupplierSearch] = useState('');
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [addSupCompany, setAddSupCompany] = useState('');
  const [addSupGst, setAddSupGst] = useState('');
  const [addSupPhone, setAddSupPhone] = useState('');
  const [addSupEmail, setAddSupEmail] = useState('');
  const [addSupAddress, setAddSupAddress] = useState('');
  const [addSupTerms, setAddSupTerms] = useState('Net 30');
  
  // Quick manual restock action state
  const [restockAmount, setRestockAmount] = useState<{ [key: string]: number }>({});

  // Modal Control States
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  // Invoice upload & analysis workflow state
  const [isUploading, setIsUploading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [extractionResult, setExtractionResult] = useState<any | null>(null);
  const [verificationData, setVerificationData] = useState<any[]>([]);
  const [newProductToCreate, setNewProductToCreate] = useState<any | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);

  // Add Product form state
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'Building Materials',
    supplier: 'Apex Chemical Industries',
    unit: 'Bag',
    hsnCode: '',
    gstRate: 18,
    cost: 0,
    price: 0,
    minStock: 20,
    warehouseLocation: '',
    stock: 0
  });

  // AI recommendations live refresh state
  const [isRefreshingAI, setIsRefreshingAI] = useState(false);
  const [aiAnalysisCache, setAiAnalysisCache] = useState<{ [key: string]: any }>({});

  const symbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Unique categories list
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Status helper based on safety margins
  const getStockStatus = (p: Product) => {
    if (p.stock <= p.minStock) {
      return { label: 'Low Stock', color: 'bg-rose-500/10 border-rose-500/20 text-rose-400 font-bold' };
    }
    if (p.stock <= p.minStock * 2) {
      return { label: 'Moderate', color: 'bg-amber-500/10 border-amber-500/20 text-amber-400 font-bold' };
    }
    return { label: 'Healthy', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold' };
  };

  // Filter & Search & Sort logical pipeline
  const filteredProducts = products
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.supplier.toLowerCase().includes(search.toLowerCase()) ||
                          (p.hsnCode && p.hsnCode.includes(search)) ||
                          (p.warehouseLocation && p.warehouseLocation.toLowerCase().includes(search.toLowerCase()));
      const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') comparison = a.name.localeCompare(b.name);
      if (sortField === 'stock') comparison = a.stock - b.stock;
      if (sortField === 'price') comparison = a.price - b.price;
      if (sortField === 'category') comparison = a.category.localeCompare(b.category);
      if (sortField === 'warehouseLocation') comparison = (a.warehouseLocation || '').localeCompare(b.warehouseLocation || '');

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Action 1: Manual Add Product
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `p${products.length + 1}`;
    const productToAdd: Product = {
      id: newId,
      name: newProductForm.name,
      category: newProductForm.category,
      stock: Number(newProductForm.stock),
      minStock: Number(newProductForm.minStock),
      supplier: newProductForm.supplier,
      price: Number(newProductForm.price),
      cost: Number(newProductForm.cost),
      unit: newProductForm.unit,
      salesGrowth: 5,
      hsnCode: newProductForm.hsnCode || '3208',
      gstRate: Number(newProductForm.gstRate),
      warehouseLocation: newProductForm.warehouseLocation || 'WH-A1',
      aiRecommendation: `Newly introduced catalog item. Initial supply of ${newProductForm.stock} committed. Maintain reorder benchmark.`,
      purchaseHistory: [
        {
          date: new Date().toISOString().split('T')[0],
          invoiceNumber: 'INITIAL-OPEN',
          supplierName: newProductForm.supplier,
          quantity: Number(newProductForm.stock),
          unitPrice: Number(newProductForm.cost),
          gstPaid: Math.round(Number(newProductForm.cost) * Number(newProductForm.stock) * (Number(newProductForm.gstRate) / 100)),
          totalAmount: Math.round(Number(newProductForm.cost) * Number(newProductForm.stock) * (1 + Number(newProductForm.gstRate) / 100))
        }
      ]
    };

    setProducts(prev => [...prev, productToAdd]);

    // Log movement
    if (productToAdd.stock > 0) {
      const movement: InventoryMovement = {
        id: `m-${Date.now()}`,
        productId: newId,
        productName: productToAdd.name,
        type: 'Adjustment',
        quantity: productToAdd.stock,
        date: new Date().toISOString().split('T')[0],
        reference: 'Initial Stock Provisioning',
        user: 'Operations Manager',
        stockAfter: productToAdd.stock
      };
      setMovements(prev => [movement, ...prev]);
    }

    // Reset Form
    setNewProductForm({
      name: '',
      category: 'Building Materials',
      supplier: 'Apex Chemical Industries',
      unit: 'Bag',
      hsnCode: '',
      gstRate: 18,
      cost: 0,
      price: 0,
      minStock: 20,
      warehouseLocation: '',
      stock: 0
    });
    setShowAddProductModal(false);
  };

  // Action 2: PDF/Image Upload and OCR processing
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processInvoiceFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processInvoiceFile(e.target.files[0]);
    }
  };

  // Converts file to Base64 and executes server OCR extraction route with progressive enterprise loaders
  const processInvoiceFile = async (file: File) => {
    setIsUploading(true);
    setLoadingStage(0);
    setOcrError(null);
    setExtractionResult(null);

    // Progressive step interval (400ms per stage) to give high-end ERP feel
    const stageTimer = setInterval(() => {
      setLoadingStage(prev => {
        if (prev < 6) {
          return prev + 1;
        }
        return prev;
      });
    }, 400);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        try {
          const response = await fetch("/api/invoice/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileData: base64data,
              mimeType: file.type || "image/png"
            })
          });

          const responseText = await response.text();
          let data;
          try {
            data = JSON.parse(responseText);
          } catch (jsonErr) {
            throw new Error(`Server returned invalid response format (Status ${response.status}). Please try again.`);
          }

          if (!response.ok) {
            throw new Error(data.error || "Invoice OCR analysis failed.");
          }
          
          setTimeout(() => {
            clearInterval(stageTimer);
            setLoadingStage(7); // Completed
            setTimeout(() => {
              setExtractionResult(data);
              prepareVerificationMatrix(data);
              setIsUploading(false);
            }, 300);
          }, 800);

        } catch (err: any) {
          clearInterval(stageTimer);
          setIsUploading(false);
          console.error(err);
          setOcrError(err.message || "Failed to process document file.");
        }
      };
    } catch (err: any) {
      clearInterval(stageTimer);
      setIsUploading(false);
      console.error(err);
      setOcrError(err.message || "Failed to process document file.");
    }
  };

  // Helper function to calculate String Similarity Percentage using Levenshtein distance
  const getStringSimilarity = (s1: string, s2: string): number => {
    const clean1 = s1.toLowerCase().trim();
    const clean2 = s2.toLowerCase().trim();
    if (clean1 === clean2) return 1.0;
    
    const m = clean1.length;
    const n = clean2.length;
    if (m === 0) return n === 0 ? 1.0 : 0.0;
    if (n === 0) return 0.0;
    
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (clean1[i - 1] === clean2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
        }
      }
    }
    const distance = dp[m][n];
    const maxLength = Math.max(m, n);
    return (maxLength - distance) / maxLength;
  };

  // Helper function to predict category based on keywords (AI suggestion flavor)
  const predictCategory = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('pipe') || lower.includes('trap') || lower.includes('elbow') || lower.includes('tee') || lower.includes('socket') || lower.includes('plumb') || lower.includes('valve') || lower.includes('bushing') || lower.includes('union')) {
      return 'Plumbing';
    }
    if (lower.includes('paint') || lower.includes('coat') || lower.includes('primer') || lower.includes('shield') || lower.includes('brush') || lower.includes('roller') || lower.includes('wall paint')) {
      return 'Paints & Coatings';
    }
    if (lower.includes('steel') || lower.includes('metal') || lower.includes('iron') || lower.includes('structure') || lower.includes('beam') || lower.includes('rod') || lower.includes('fastener') || lower.includes('bolt') || lower.includes('screw')) {
      return 'Metal & Structure';
    }
    if (lower.includes('plywood') || lower.includes('timber') || lower.includes('board') || lower.includes('lumber') || lower.includes('wood') || lower.includes('door')) {
      return 'Timber & Hardware';
    }
    if (lower.includes('elect') || lower.includes('wire') || lower.includes('cable') || lower.includes('switch') || lower.includes('plug') || lower.includes('socket') || lower.includes('led') || lower.includes('bulb')) {
      return 'Electrical';
    }
    if (lower.includes('sanit') || lower.includes('basin') || lower.includes('toilet') || lower.includes('faucet') || lower.includes('shower') || lower.includes('sink')) {
      return 'Plumbing & Sanitary';
    }
    if (lower.includes('screws') || lower.includes('nails') || lower.includes('hinge') || lower.includes('bolt') || lower.includes('tool') || lower.includes('hardware') || lower.includes('anchor')) {
      return 'Hardware';
    }
    return 'Building Materials';
  };

  // Helper function to generate SKU automatically
  const generateSKU = (name: string, supplier: string, category: string): string => {
    const cleanName = name.toUpperCase().replace(/[^A-Z0-9\s.-]/g, '');
    const tokens = cleanName.split(/[\s.-]+/).filter(Boolean);
    
    let prefix = '';
    if (supplier && supplier.trim().length >= 3) {
      prefix = supplier.trim().substring(0, 3).toUpperCase();
    } else if (tokens.length > 0) {
      prefix = tokens[0].substring(0, 3);
    } else {
      prefix = 'GEN';
    }

    // Extract numbers or other descriptive tokens
    const middleTokens = tokens.filter(t => t !== prefix && t.length > 0).slice(0, 2);
    if (middleTokens.length === 0) {
      middleTokens.push('SKU');
    }

    const base = [prefix, ...middleTokens].join('-');
    const seq = Math.floor(Math.random() * 900) + 100;
    return `${base}-${seq}`;
  };

  // Helper to normalize product names for deterministic matching
  const normalizeProductName = (name: string): string => {
    if (!name) return "";
    let val = name.toLowerCase();
    // Remove brackets, quotes, punctuation
    val = val.replace(/[()[\]{}'"`.,\/#!$%\^&\*;:{}=\-_`~?]/g, " ");
    // Collapse multiple spaces
    val = val.replace(/\s+/g, " ").trim();
    // Standardize common units inside text
    val = val.replace(/\b(bags|bag)\b/g, "bag");
    val = val.replace(/\b(tubs|tub)\b/g, "tub");
    val = val.replace(/\b(cans|can)\b/g, "can");
    val = val.replace(/\b(sheets|sheet)\b/g, "sheet");
    val = val.replace(/\b(boxes|box)\b/g, "box");
    val = val.replace(/\b(litres|litre|ltrs|ltr|l)\b/g, "ltr");
    val = val.replace(/\b(kgs|kg|kilograms|kilogram)\b/g, "kg");
    val = val.replace(/\b(pcs|pc|pieces|piece)\b/g, "pc");
    return val;
  };

  // Redesigned Deterministic Product Matching Engine
  const evaluateProductMatch = (item: any, productsList: Product[], supplierName: string): { 
    matchedProduct: Product | null; 
    confidence: number; 
    matchType: 'exact' | 'possible' | 'new'; 
    matchReason: string;
  } => {
    const incomingName = item.productName || "";
    const normalizedIncomingName = normalizeProductName(incomingName);
    const incomingHSN = (item.hsnCode || "").trim().toLowerCase();
    const incomingSKU = (item.sku || "").trim().toLowerCase();
    const incomingUnit = (item.unit || "").trim().toLowerCase();

    // Helper to extract a brand name from text
    const extractBrand = (name: string): string => {
      const brands = ["apex", "ultratech", "tata", "jindal", "berger", "nerolac", "birla", "asian paints", "asian", "jsw"];
      const lowercaseName = name.toLowerCase();
      for (const b of brands) {
        if (lowercaseName.includes(b)) return b;
      }
      // Fallback: use first word if it has length > 3
      const firstWord = lowercaseName.split(" ")[0];
      if (firstWord && firstWord.length > 3) return firstWord;
      return "";
    };

    const incomingBrand = extractBrand(incomingName) || extractBrand(supplierName);

    let bestMatch: Product | null = null;
    let bestConfidence = 0;
    let bestReason = "No matching items identified";

    for (const p of productsList) {
      const existingName = p.name || "";
      const normalizedExistingName = normalizeProductName(existingName);
      const existingHSN = (p.hsnCode || "").trim().toLowerCase();
      const existingSKU = (p.sku || "").trim().toLowerCase();
      const existingUnit = (p.unit || "").trim().toLowerCase();
      const existingBrand = extractBrand(existingName) || extractBrand(p.supplier || "");

      let confidence = 0;
      let reason = "";

      // Check priority tiers:
      const isSkuMatch = incomingSKU && existingSKU && incomingSKU === existingSKU;
      const isNameMatch = normalizedIncomingName && normalizedExistingName && normalizedIncomingName === normalizedExistingName;
      const isHsnMatch = incomingHSN && existingHSN && incomingHSN === existingHSN && incomingHSN !== "3208" && incomingHSN !== "2523";
      const isBrandUnitMatch = incomingBrand && existingBrand && incomingBrand === existingBrand && incomingUnit && existingUnit && incomingUnit === existingUnit;
      
      // Calculate fuzzy similarity as base line
      const fuzzySim = getStringSimilarity(existingName, incomingName);

      if (isSkuMatch) {
        confidence = 100;
        reason = `SKU Match: Exact overlap with SKU code [${p.sku}]`;
      } else if (isNameMatch) {
        confidence = 100;
        reason = "Normalized Name Match: Complete match after punctuation/unit normalization";
      } else if (isHsnMatch) {
        if (fuzzySim >= 0.75) {
          confidence = 98;
          reason = `HSN Match: Same HSN [${p.hsnCode}] with high fuzzy name similarity (${Math.round(fuzzySim*100)}%)`;
        } else {
          confidence = 88;
          reason = `HSN Match: Same HSN [${p.hsnCode}] but different name branding (${Math.round(fuzzySim*100)}%)`;
        }
      } else if (isBrandUnitMatch) {
        if (fuzzySim >= 0.8) {
          confidence = 94;
          reason = `Brand & Unit Match: Same brand [${incomingBrand}] and unit [${incomingUnit}] with ${Math.round(fuzzySim*100)}% text similarity`;
        } else if (fuzzySim >= 0.5) {
          confidence = 85;
          reason = `Brand & Unit Match: Same brand [${incomingBrand}] and unit [${incomingUnit}] with moderate similarity (${Math.round(fuzzySim*100)}%)`;
        } else {
          confidence = 81;
          reason = `Brand & Unit Match: Brand/unit match but low similarity (${Math.round(fuzzySim*100)}%)`;
        }
      } else {
        confidence = Math.round(fuzzySim * 100);
        reason = `Fuzzy Similarity: ${confidence}% lexical similarity`;
      }

      if (confidence > bestConfidence) {
        bestConfidence = confidence;
        bestMatch = p;
        bestReason = reason;
      }
    }

    // Dynamic Matching Rules mapping:
    let matchType: 'exact' | 'possible' | 'new' = 'new';
    if (bestConfidence >= 95) {
      matchType = 'exact';
    } else if (bestConfidence >= 80) {
      matchType = 'possible';
    } else {
      matchType = 'new';
      bestMatch = null; // High confidence isolation
    }

    return {
      matchedProduct: bestMatch,
      confidence: bestConfidence,
      matchType,
      matchReason: bestReason
    };
  };

  // Compares extracted items against existing database products to calculate verification values
  const prepareVerificationMatrix = (invoice: any) => {
    const matrix = invoice.items.map((item: any) => {
      const supplierName = (invoice.supplierName || 'Apex Chemical Industries').trim();
      
      const { matchedProduct, confidence, matchType, matchReason } = evaluateProductMatch(item, products, supplierName);

      // Rule of confidence: matchType 'exact' (>=95%) or 'possible' (80-95%) can be merged.
      // High-confidence 'exact' defaults to 'merge'.
      // Medium-confidence 'possible' (80-95%) defaults to 'merge' but lets user toggle.
      // Low-confidence 'new' (<80%) defaults to 'new' and creates SKU.
      const isMerge = matchType === 'exact' || matchType === 'possible';
      const matchedProd = matchedProduct;
      const currentStock = matchedProd ? matchedProd.stock : 0;
      const currentCost = matchedProd ? matchedProd.cost : 0;
      
      const incomingQty = Number(item.quantity) || 0;
      const incomingPrice = Number(item.unitPrice) || 0;
      const discount = Number(item.discount || 0);

      const totalNewQty = currentStock + incomingQty;
      const newStock = isMerge ? totalNewQty : incomingQty;
      const newCost = (isMerge && matchedProd && totalNewQty > 0)
        ? Math.round(((currentStock * currentCost) + (incomingQty * incomingPrice)) / totalNewQty)
        : incomingPrice;

      // Pre-populate high-quality properties for new SKU creation
      const predictedCategory = predictCategory(item.productName);
      const autoSKU = item.sku || generateSKU(item.productName, supplierName, predictedCategory);
      
      const candidateProductDetails = {
        name: item.productName,
        category: predictedCategory,
        supplier: supplierName,
        unit: item.unit || 'Unit',
        hsnCode: item.hsnCode || '3208',
        gstRate: Number(item.gstRate || 18),
        cost: incomingPrice,
        price: Math.round(incomingPrice * 1.35), // Default 35% margin markup
        minStock: 20,
        warehouseLocation: `WH-B${Math.floor(Math.random()*4)+1}-Shelf${Math.floor(Math.random()*5)+1}`,
        stock: incomingQty,
        sku: autoSKU,
        aiRecommendation: `New product line established from supplier invoice. Maintain regular supply buffers in ${predictedCategory}.`
      };

      const ocrConfidence = typeof item.confidence === 'number' ? item.confidence : 100;
      const isUncertain = ocrConfidence < 90;

      return {
        id: `vitem-${Math.random()}`,
        extractedName: item.productName,
        matchedProduct: matchedProd,
        matchType,
        similarity: confidence,
        matchReason,
        userChoice: isMerge ? 'merge' : 'new',
        incomingQty,
        incomingPrice,
        discount,
        gstRate: Number(item.gstRate || 18),
        hsnCode: item.hsnCode || '3208',
        unit: item.unit || 'Unit',
        currentStock,
        newStock,
        currentCost,
        newCost,
        isCreated: matchType === 'new', // Auto-completed candidate ready to go!
        createdProduct: candidateProductDetails,
        ocrConfidence,
        isUncertain,
        isVerified: false
      };
    });

    setVerificationData(matrix);
  };

  // Toggle user preference for matching highly similar SKU items
  const toggleUserChoice = (id: string, choice: 'merge' | 'new') => {
    setVerificationData(prev => prev.map(item => {
      if (item.id === id) {
        const isMerge = choice === 'merge';
        const matched = item.matchedProduct;
        
        const currentStock = matched ? matched.stock : 0;
        const newStock = isMerge ? currentStock + item.incomingQty : item.incomingQty;
        const currentCost = matched ? matched.cost : 0;
        const newCost = (isMerge && matched)
          ? Math.round(((currentStock * currentCost) + (item.incomingQty * item.incomingPrice)) / (currentStock + item.incomingQty))
          : item.incomingPrice;

        return {
          ...item,
          userChoice: choice,
          newStock,
          newCost
        };
      }
      return item;
    }));
  };

  // User manual verification for uncertain OCR rows
  const handleVerifyRow = (id: string) => {
    setVerificationData(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          isVerified: true
        };
      }
      return item;
    }));
  };

  // Launch AI Product Creator modal for new items
  const triggerCreateNewProduct = (item: any) => {
    const cp = item.createdProduct || {};
    const predictedCat = cp.category || predictCategory(item.extractedName);
    const skuVal = cp.sku || generateSKU(item.extractedName, extractionResult?.supplierName || '', predictedCat);
    setNewProductToCreate({
      tempId: item.id,
      name: cp.name || item.extractedName,
      category: predictedCat,
      supplier: cp.supplier || extractionResult?.supplierName || 'Apex Chemical Industries',
      unit: cp.unit || item.unit || 'Bag',
      hsnCode: cp.hsnCode || item.hsnCode || '3208',
      gstRate: cp.gstRate || item.gstRate || 18,
      cost: cp.cost || item.incomingPrice,
      price: cp.price || Math.round(item.incomingPrice * 1.35), // Default 35% margin markup
      minStock: cp.minStock || 20,
      warehouseLocation: cp.warehouseLocation || `WH-B${Math.floor(Math.random()*4)+1}-Shelf${Math.floor(Math.random()*5)+1}`,
      stock: cp.stock || item.incomingQty,
      sku: skuVal
    });
  };

  // Save the custom product from AI modal
  const handleSaveAIProduct = () => {
    if (!newProductToCreate) return;

    // Update Verification Data list to replace temporary new marker with this freshly set product
    setVerificationData(prev => prev.map(item => {
      if (item.id === newProductToCreate.tempId) {
        return {
          ...item,
          isCreated: true,
          createdProduct: {
            ...newProductToCreate,
            id: `p${products.length + 1 + Math.random()}` // Temp unique ID
          }
        };
      }
      return item;
    }));

    setNewProductToCreate(null);
  };

  // Commit dynamic changes to inventory states after verification
  const handleCommitInvoice = () => {
    if (!extractionResult) return;

    // Check if any low-confidence OCR rows are unverified
    const unverifiedUncertainRows = verificationData.filter(item => item.isUncertain && !item.isVerified);
    if (unverifiedUncertainRows.length > 0) {
      setOcrError(`Enterprise Compliance Block: There are ${unverifiedUncertainRows.length} low-confidence extracted rows that must be manually reviewed and verified (click "Verify Row") before commitment.`);
      return;
    }

    // Reset error state on success
    setOcrError(null);

    const todayStr = new Date().toISOString().split('T')[0];
    let updatedProducts = [...products];
    const newMovements: InventoryMovement[] = [];

    verificationData.forEach(item => {
      const isMergeChoice = item.userChoice === 'merge' && item.matchedProduct;
      
      if (isMergeChoice) {
        // Option A: Update Existing Product (Stock & Recalculate Weighted Avg Cost)
        updatedProducts = updatedProducts.map(p => {
          if (p.id === item.matchedProduct.id) {
            const hist = p.purchaseHistory || [];
            return {
              ...p,
              stock: item.newStock,
              cost: item.newCost,
              purchaseHistory: [
                ...hist,
                {
                  date: todayStr,
                  invoiceNumber: extractionResult.invoiceNumber,
                  supplierName: extractionResult.supplierName,
                  quantity: item.incomingQty,
                  unitPrice: item.incomingPrice,
                  gstPaid: Math.round((item.incomingPrice * item.incomingQty) * (item.gstRate / 100)),
                  totalAmount: Math.round((item.incomingPrice * item.incomingQty) * (1 + item.gstRate / 100))
                }
              ]
            };
          }
          return p;
        });

        newMovements.push({
          id: `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          productId: item.matchedProduct.id,
          productName: item.matchedProduct.name,
          type: 'Purchase',
          quantity: item.incomingQty,
          date: todayStr,
          reference: `Invoice #${extractionResult.invoiceNumber}`,
          user: 'SAP AI Core Process',
          stockAfter: item.newStock
        });
      } else {
        // Option B: Insert verified New Product (either newly drafted, or auto-completed to prevent blockage)
        const newId = `p-${Date.now()}-${Math.floor(Math.random()*100)}`;
        const pDetails = item.isCreated && item.createdProduct ? item.createdProduct : {
          name: item.extractedName,
          category: predictCategory(item.extractedName),
          supplier: extractionResult.supplierName,
          unit: item.unit,
          hsnCode: item.hsnCode,
          gstRate: item.gstRate,
          cost: item.incomingPrice,
          price: Math.round(item.incomingPrice * 1.35),
          minStock: 20,
          warehouseLocation: `WH-B${Math.floor(Math.random()*4)+1}-Shelf${Math.floor(Math.random()*5)+1}`,
          stock: item.incomingQty,
          sku: generateSKU(item.extractedName, extractionResult.supplierName, predictCategory(item.extractedName))
        };

        const pToAdd: Product = {
          id: newId,
          name: pDetails.name,
          category: pDetails.category,
          stock: pDetails.stock,
          minStock: pDetails.minStock,
          supplier: pDetails.supplier,
          price: pDetails.price,
          cost: pDetails.cost,
          unit: pDetails.unit,
          salesGrowth: 10,
          hsnCode: pDetails.hsnCode,
          gstRate: pDetails.gstRate,
          warehouseLocation: pDetails.warehouseLocation,
          sku: pDetails.sku || generateSKU(pDetails.name, pDetails.supplier, pDetails.category),
          aiRecommendation: `New product line established from supplier invoice. Maintain regular supply buffers in ${pDetails.category}.`,
          purchaseHistory: [
            {
              date: todayStr,
              invoiceNumber: extractionResult.invoiceNumber,
              supplierName: extractionResult.supplierName,
              quantity: pDetails.stock,
              unitPrice: pDetails.cost,
              gstPaid: Math.round((pDetails.cost * pDetails.stock) * (pDetails.gstRate / 100)),
              totalAmount: Math.round((pDetails.cost * pDetails.stock) * (1 + pDetails.gstRate / 100))
            }
          ]
        };

        updatedProducts.push(pToAdd);

        newMovements.push({
          id: `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          productId: newId,
          productName: pToAdd.name,
          type: 'Purchase',
          quantity: pDetails.stock,
          date: todayStr,
          reference: `Invoice #${extractionResult.invoiceNumber}`,
          user: 'SAP AI Core Process',
          stockAfter: pDetails.stock
        });
      }
    });

    // Update global products list
    setProducts(updatedProducts);
    
    // Add transaction entries to movements
    setMovements(prev => [...newMovements, ...prev]);

    // Automatic Supplier Registration and Master List Update (Part 5)
    const supplierNameNormal = extractionResult.supplierName.trim();
    const existingSupplier = suppliers.find(s => s.companyName.toLowerCase() === supplierNameNormal.toLowerCase());
    
    let updatedSuppliers = [...suppliers];
    let targetSupplierId = "";

    if (!existingSupplier) {
      const newSupplierId = `sup-${Date.now()}`;
      targetSupplierId = newSupplierId;
      const newSup: Supplier = {
        id: newSupplierId,
        companyName: supplierNameNormal,
        gst: extractionResult.supplierGst || '07AAAAA1111A1Z1',
        phone: extractionResult.supplierPhone || '+91 99988 87776',
        email: extractionResult.supplierEmail || `ops@${supplierNameNormal.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        address: extractionResult.supplierAddress || 'Plot 45, Industrial Growth Centre, Sector 4, New Delhi',
        paymentTerms: 'Net 30',
        outstandingBalance: extractionResult.totalAmount,
        purchaseHistory: [
          {
            date: todayStr,
            invoiceNumber: extractionResult.invoiceNumber,
            amount: extractionResult.totalAmount,
            status: 'Unpaid'
          }
        ],
        productsSupplied: verificationData.map(item => item.extractedName)
      };
      updatedSuppliers.push(newSup);
    } else {
      targetSupplierId = existingSupplier.id;
      updatedSuppliers = updatedSuppliers.map(s => {
        if (s.id === existingSupplier.id) {
          const currentPurchases = s.purchaseHistory || [];
          const currentSupplied = s.productsSupplied || [];
          const itemsExtracted = verificationData.map(item => item.extractedName);
          const newSupplied = Array.from(new Set([...currentSupplied, ...itemsExtracted]));
          
          return {
            ...s,
            outstandingBalance: (s.outstandingBalance || 0) + extractionResult.totalAmount,
            purchaseHistory: [
              ...currentPurchases,
              {
                date: todayStr,
                invoiceNumber: extractionResult.invoiceNumber,
                amount: extractionResult.totalAmount,
                status: 'Unpaid'
              }
            ],
            productsSupplied: newSupplied
          };
        }
        return s;
      });
    }
    setSuppliers(updatedSuppliers);

    // Update Supplier ledger credit balance
    const billAmount = extractionResult.totalAmount || 0;
    const previousEntries = supplierLedger.filter(l => l.supplierName.toLowerCase() === supplierNameNormal.toLowerCase());
    const prevBalance = previousEntries.length > 0 ? previousEntries[previousEntries.length - 1].balance : 0;
    
    const ledgerEntry: SupplierLedgerEntry = {
      id: `l-${Date.now()}`,
      supplierName: supplierNameNormal,
      date: todayStr,
      transactionType: 'Bill',
      reference: `Inv #${extractionResult.invoiceNumber}`,
      amount: billAmount,
      balance: prevBalance + billAmount
    };

    const updatedSupplierLedger = [...supplierLedger, ledgerEntry];
    setSupplierLedger(updatedSupplierLedger);

    // Save and cache ERP memory states in localStorage to persist for AI Copilot Memory across navigations
    try {
      localStorage.setItem("bizpilot_last_invoice", JSON.stringify({
        invoiceNumber: extractionResult.invoiceNumber,
        supplierName: extractionResult.supplierName,
        invoiceDate: extractionResult.invoiceDate,
        totalAmount: extractionResult.totalAmount,
        subtotal: extractionResult.subtotal || billAmount,
        discount: extractionResult.discount || 0,
        gst: extractionResult.gst || 0,
        roundOff: extractionResult.roundOff || 0,
        itemsCount: verificationData.length
      }));

      localStorage.setItem("bizpilot_inventory_context", JSON.stringify({
        totalProducts: updatedProducts.length,
        lowStockCount: updatedProducts.filter(p => p.stock <= p.minStock).length,
        totalValuation: updatedProducts.reduce((sum, p) => sum + (p.stock * p.cost), 0)
      }));

      localStorage.setItem("bizpilot_supplier_context", JSON.stringify({
        lastActiveSupplier: extractionResult.supplierName,
        totalOutstandingBalance: updatedSupplierLedger.reduce((sum, entry) => sum + (entry.transactionType === 'Bill' ? entry.amount : -entry.amount), 0)
      }));
    } catch (err) {
      console.warn("Could not save to localStorage:", err);
    }

    if (onAddAuditLog) {
      onAddAuditLog('Inventory Imported', `Inv #${extractionResult.invoiceNumber} (${extractionResult.supplierName})`, 'SUCCESS', 'SAP AI Core Process');
      if (!existingSupplier) {
        onAddAuditLog('Supplier Added', `${supplierNameNormal}`, 'SUCCESS', 'SAP AI Core Process');
      }
      verificationData.forEach(item => {
        onAddAuditLog('Stock Updated', `${item.extractedName} (+${item.incomingQty} ${item.unit})`, 'SUCCESS', 'SAP AI Core Process');
      });
    }

    // Trigger AI dashboard forecast recalculation
    refreshAIRecommendations();

    // Cleanup & Close
    setExtractionResult(null);
    setVerificationData([]);
    setShowImportModal(false);
  };

  // Action 3: Receive Purchase Order
  const handleOpenReceivePO = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setShowReceiveModal(true);
  };

  const commitPOReceipt = (receivedQtys: { [key: string]: number }) => {
    if (!selectedPO) return;
    const todayStr = new Date().toISOString().split('T')[0];
    let updatedProducts = [...products];
    const newMovements: InventoryMovement[] = [];

    selectedPO.items.forEach(item => {
      const recQty = receivedQtys[item.productName] !== undefined ? receivedQtys[item.productName] : item.quantity;
      if (recQty <= 0) return;

      // Find if product exists in database by name
      const match = updatedProducts.find(p => p.name.toLowerCase() === item.productName.toLowerCase());
      
      if (match) {
        updatedProducts = updatedProducts.map(p => {
          if (p.id === match.id) {
            const hist = p.purchaseHistory || [];
            const newCost = Math.round(((p.stock * p.cost) + (recQty * item.price)) / (p.stock + recQty));
            return {
              ...p,
              stock: p.stock + recQty,
              cost: newCost,
              purchaseHistory: [
                ...hist,
                {
                  date: todayStr,
                  invoiceNumber: `RCV-${selectedPO.poNumber}`,
                  supplierName: selectedPO.supplierName,
                  quantity: recQty,
                  unitPrice: item.price,
                  gstPaid: Math.round((item.price * recQty) * ((item.gstRate || 18) / 100)),
                  totalAmount: Math.round((item.price * recQty) * (1 + (item.gstRate || 18) / 100))
                }
              ]
            };
          }
          return p;
        });

        newMovements.push({
          id: `m-${Date.now()}-${Math.floor(Math.random()*100)}`,
          productId: match.id,
          productName: match.name,
          type: 'Purchase',
          quantity: recQty,
          date: todayStr,
          reference: `Receipt of PO #${selectedPO.poNumber}`,
          user: 'Store In-charge',
          stockAfter: match.stock + recQty
        });
      }
    });

    setProducts(updatedProducts);
    setMovements(prev => [...newMovements, ...prev]);

    // Mark PO as received in list
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id === selectedPO.id) {
        return {
          ...po,
          status: 'Received',
          items: po.items.map(item => ({
            ...item,
            receivedQuantity: receivedQtys[item.productName] !== undefined ? receivedQtys[item.productName] : item.quantity
          }))
        };
      }
      return po;
    }));

    // Update supplier ledger for the PO bill
    const poBillAmount = selectedPO.totalAmount;
    const previousEntries = supplierLedger.filter(l => l.supplierName.toLowerCase() === selectedPO.supplierName.toLowerCase());
    const prevBalance = previousEntries.length > 0 ? previousEntries[previousEntries.length - 1].balance : 0;
    
    const ledgerEntry: SupplierLedgerEntry = {
      id: `l-${Date.now()}`,
      supplierName: selectedPO.supplierName,
      date: todayStr,
      transactionType: 'Bill',
      reference: `PO Billing #${selectedPO.poNumber}`,
      amount: poBillAmount,
      balance: prevBalance + poBillAmount
    };
    
    setSupplierLedger(prev => [...prev, ledgerEntry]);

    if (onAddAuditLog) {
      onAddAuditLog('Purchase Order Approved', `PO #${selectedPO.poNumber} (Supplier: ${selectedPO.supplierName})`, 'SUCCESS', 'Store In-charge');
      selectedPO.items.forEach(item => {
        const recQty = receivedQtys[item.productName] !== undefined ? receivedQtys[item.productName] : item.quantity;
        if (recQty > 0) {
          onAddAuditLog('Stock Updated', `${item.productName} (+${recQty} ${item.unit})`, 'SUCCESS', 'Store In-charge');
        }
      });
    }

    setShowReceiveModal(false);
    setSelectedPO(null);
  };

  // Action 4: Export Inventory (CSV Exporter)
  const handleExportCSV = () => {
    const headers = ['Product ID', 'Name', 'Category', 'Stock Level', 'Min Stock Level', 'Unit', 'Supplier', 'Cost Price (INR)', 'Retail Price (INR)', 'HSN Code', 'GST Rate (%)', 'Warehouse Location'];
    const rows = products.map(p => [
      p.id,
      p.name,
      p.category,
      p.stock,
      p.minStock,
      p.unit,
      p.supplier,
      p.cost,
      p.price,
      p.hsnCode || 'N/A',
      p.gstRate || '0',
      p.warehouseLocation || 'N/A'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BizPilot_ERP_Inventory_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Live Oracle Recommendation Engine fetching
  const refreshAIRecommendations = async () => {
    setIsRefreshingAI(true);
    try {
      const response = await fetch("/api/inventory/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products })
      });
      if (response.ok) {
        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error("Invalid response format received from AI advisor.");
        }
        
        // Convert to lookups mapped by product ID
        const cache: { [key: string]: any } = {};
        if (Array.isArray(data)) {
          data.forEach((rec: any) => {
            if (rec && rec.productId) {
              cache[rec.productId] = rec;
            }
          });
        }
        setAiAnalysisCache(cache);
      }
    } catch (err) {
      console.error("AI recommendations fetch failed, falling back to dynamic algorithm.", err);
    } finally {
      setIsRefreshingAI(false);
    }
  };

  // Algorithmic fallbacks for AI recommendations
  const getPredictedStockOutDate = (p: Product) => {
    const cached = aiAnalysisCache[p.id];
    if (cached) return cached.predictedStockOutDate;

    // Direct mathematical prediction
    const dailyDepletionRate = Math.max(0.5, Math.round((p.minStock * (1 + p.salesGrowth / 100)) / 30 * 10) / 10);
    if (p.stock === 0) return 'Immediate (0 left)';
    if (p.stock > p.minStock * 5) return 'Stable (> 60 days)';
    
    const daysLeft = Math.round(p.stock / dailyDepletionRate);
    const outDate = new Date();
    outDate.setDate(outDate.getDate() + daysLeft);
    return `${outDate.toISOString().split('T')[0]} (${daysLeft} days left)`;
  };

  const getExecutiveAdvice = (p: Product) => {
    const cached = aiAnalysisCache[p.id];
    if (cached) return cached.executiveAdvice;

    // Intelligent heuristic generator
    if (p.stock <= p.minStock) {
      return `Critical low stock alert. Stock velocity is high at +${p.salesGrowth}% monthly growth. Dispatch PO restock for 35 units from ${p.supplier} immediately.`;
    }
    if (p.stock > p.minStock * 6) {
      return `Overstocked. Capital locked up is ₹${(p.stock * p.cost).toLocaleString()}. Run a promotional 10% clearance discount or bundle with accessories to liberate storage.`;
    }
    return `Inventory levels healthy in ${p.warehouseLocation}. Steady supply lines maintained. Current lead times from ${p.supplier} remain normal.`;
  };

  return (
    <div className="space-y-8 animate-slideup">
      
      {/* 1. Header with Fiori SAP/Oracle Style Top Navigation and Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 pb-6 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20 text-[9px] font-mono tracking-wider font-bold">
              ORACLE SUPPLY CHAIN CORE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-mono font-bold">SYSTEM ACTIVE</span>
          </div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-white mt-1">
            BizPilot Enterprise ERP <span className="text-brand-indigo text-lg font-normal">v4.2</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time warehouse orchestration, ledger led cost valuations, and generative automated invoice auditing.
          </p>
        </div>

        {/* TOP Action Grid */}
        <div className="grid grid-cols-2 sm:flex items-center gap-3 w-full xl:w-auto">
          <button
            onClick={() => setShowAddProductModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            id="btn-add-product"
          >
            <Plus className="w-4 h-4 text-brand-cyan" />
            Add Product
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-indigo/10 hover:bg-brand-indigo/20 text-brand-indigo border border-brand-indigo/30 rounded-xl text-xs font-bold cursor-pointer transition-all"
            id="btn-import-invoice"
          >
            <Sparkles className="w-4 h-4 text-brand-indigo animate-pulse" />
            Import Invoice
          </button>

          <button
            onClick={() => setShowReceiveModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 rounded-xl text-xs font-bold cursor-pointer transition-all"
            id="btn-receive-po"
          >
            <PackageCheck className="w-4 h-4" />
            Receive PO
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            id="btn-export-inventory"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Export CSV
          </button>
        </div>
      </div>

      {/* 2. Enterprise Tab System */}
      <div className="flex flex-wrap gap-2 p-1 bg-[#09090b]/60 rounded-xl border border-slate-800/50">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'ledger'
              ? 'bg-zinc-900 text-white shadow shadow-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          Warehouse Ledger ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('procurement')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'procurement'
              ? 'bg-zinc-900 text-white shadow shadow-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          PO Procurement ({purchaseOrders.filter(p => p.status === 'Pending').length} Pending)
        </button>

        <button
          onClick={() => setActiveTab('supplier')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'supplier'
              ? 'bg-zinc-900 text-white shadow shadow-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          Supplier Accounts
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'movements'
              ? 'bg-zinc-900 text-white shadow shadow-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Movement Trail ({movements.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('recommendations');
            if (Object.keys(aiAnalysisCache).length === 0) {
              refreshAIRecommendations();
            }
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'recommendations'
              ? 'bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20'
              : 'text-slate-400 hover:text-brand-indigo hover:bg-brand-indigo/5'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Oracle AI Advisor
        </button>
      </div>

      {/* 3. Main Operational Panels Rendered Dynamically */}
      <div className="space-y-6">

        {/* TAB 1: LEDGER */}
        {activeTab === 'ledger' && (
          <>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#09090b]/40 p-4 rounded-2xl border border-slate-800/60">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search ledger by product, HSN, location, brand supplier..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-slate-800/60 rounded-xl text-xs text-white placeholder-slate-500 focus:border-brand-indigo/50 outline-none"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full sm:w-48 px-3.5 py-2.5 bg-zinc-950 border border-slate-800/60 rounded-xl text-xs text-slate-300 outline-none focus:border-brand-indigo/50 cursor-pointer"
                >
                  {categories.map((cat, i) => (
                    <option key={i} value={cat} className="bg-zinc-950">
                      {cat === 'all' ? 'All Sectors' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Main Warehouse Table */}
            <div className="glass-panel border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl shadow-[#050505]/20">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-950/60 border-b border-slate-800/60 text-slate-500">
                      <th className="p-4 font-semibold font-display cursor-pointer" onClick={() => handleSort('name')}>
                        <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                          Product Line & HSN
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </div>
                      </th>
                      <th className="p-4 font-semibold font-display cursor-pointer" onClick={() => handleSort('category')}>
                        <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                          Category / Location
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </div>
                      </th>
                      <th className="p-4 font-semibold font-display cursor-pointer" onClick={() => handleSort('stock')}>
                        <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                          Current Stock
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </div>
                      </th>
                      <th className="p-4 font-semibold font-display">Supplier</th>
                      <th className="p-4 font-semibold font-display cursor-pointer" onClick={() => handleSort('price')}>
                        <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                          Valuation Cost / Price
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </div>
                      </th>
                      <th className="p-4 font-semibold font-display">Warehouse Status</th>
                      <th className="p-4 font-semibold font-display text-center">AI Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => {
                      const status = getStockStatus(p);
                      const isExpanded = expandedId === p.id;
                      const prodMovements = movements.filter(m => m.productId === p.id);
                      
                      return (
                        <React.Fragment key={p.id}>
                          <tr 
                            className={`border-b border-slate-800/30 text-slate-300 hover:bg-white/1 cursor-pointer transition-colors ${isExpanded ? 'bg-brand-indigo/5' : ''}`}
                            onClick={() => setExpandedId(isExpanded ? null : p.id)}
                          >
                            <td className="p-4">
                              <div className="flex items-start gap-2.5">
                                <span className={`w-2 h-2 rounded-full mt-1.5 ${p.stock <= p.minStock ? 'bg-rose-500 animate-ping' : 'bg-transparent'}`} />
                                <div>
                                  <span className="font-semibold text-white block">{p.name}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">HSN: {p.hsnCode || '3208'} | GST: {p.gstRate || 18}%</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-slate-400 block font-medium">{p.category}</span>
                              <div className="flex items-center gap-1 text-[10px] text-brand-cyan font-mono mt-0.5">
                                <MapPin className="w-3 h-3 text-brand-cyan" />
                                {p.warehouseLocation || 'WH-Zone A'}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-mono font-bold text-gray-200 block text-sm">{p.stock} {p.unit}s</span>
                              <span className="text-[10px] text-slate-500">Min Buffer: {p.minStock}</span>
                            </td>
                            <td className="p-4 text-slate-400">{p.supplier}</td>
                            <td className="p-4">
                              <div className="font-mono">
                                <span className="text-slate-400 block">Avg Cost: <b className="text-white">{formatCurrency(p.cost, true)}</b></span>
                                <span className="text-brand-cyan text-[10px]">Retail: {formatCurrency(p.price, true)}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] border ${status.color}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedId(isExpanded ? null : p.id);
                                }}
                                className="p-1.5 rounded-lg bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo hover:bg-brand-indigo hover:text-white transition-all"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Card Details (History & AI analysis) */}
                          {isExpanded && (
                            <tr className="bg-zinc-950/40 border-b border-slate-800/60">
                              <td colSpan={7} className="p-6">
                                <div className="space-y-6">
                                  
                                  {/* Section A: Recommendations */}
                                  <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center bg-[#09090b] p-4 rounded-xl border border-slate-800">
                                    <div className="flex gap-4 max-w-3xl">
                                      <div className="p-3 rounded-xl bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo h-fit">
                                        <Sparkles className="w-5 h-5 animate-spin-slow" />
                                      </div>
                                      <div>
                                        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">BIZPILOT SUPPLY ADVICE</h4>
                                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{getExecutiveAdvice(p)}</p>
                                        <p className="text-[10px] text-brand-cyan font-mono mt-1">Predicted Stock-out Date: {getPredictedStockOutDate(p)}</p>
                                      </div>
                                    </div>

                                    {/* Quick restock block */}
                                    <div className="flex items-center gap-3 bg-zinc-950 p-2.5 rounded-lg border border-slate-800/60 shrink-0 w-full lg:w-auto">
                                      <input
                                        type="number"
                                        min={10}
                                        placeholder="Qty"
                                        value={restockAmount[p.id] || ''}
                                        onChange={(e) => setRestockAmount({ ...restockAmount, [p.id]: parseInt(e.target.value) || 0 })}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-20 px-2.5 py-1.5 bg-[#050505] border border-slate-800 text-xs text-white outline-none rounded-lg focus:border-brand-indigo"
                                      />
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const qty = restockAmount[p.id] || 50;
                                          onRestock(p.id, qty);
                                          
                                          // Log dynamic movement
                                          setMovements(prev => [{
                                            id: `m-${Date.now()}`,
                                            productId: p.id,
                                            productName: p.name,
                                            type: 'Adjustment',
                                            quantity: qty,
                                            date: new Date().toISOString().split('T')[0],
                                            reference: 'Quick Dashboard Restock',
                                            user: 'Warehouse Lead',
                                            stockAfter: p.stock + qty
                                          }, ...prev]);

                                          setRestockAmount(prev => ({ ...prev, [p.id]: 0 }));
                                        }}
                                        className="px-3.5 py-1.5 text-[10px] font-bold bg-brand-cyan hover:bg-brand-cyan/90 text-gray-950 rounded-lg transition-all cursor-pointer"
                                      >
                                        Restock {p.unit}
                                      </button>
                                    </div>
                                  </div>

                                  {/* Section B: Dynamic ERP Purchase History logs */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-[#09090b]/40 p-4 rounded-xl border border-slate-800/60">
                                      <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
                                        <ArrowUpRight className="w-4 h-4 text-brand-indigo" />
                                        Ledger Purchase Record Logs
                                      </h5>
                                      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2">
                                        {p.purchaseHistory && p.purchaseHistory.length > 0 ? (
                                          p.purchaseHistory.map((h, i) => (
                                            <div key={i} className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-lg border border-slate-900 text-[11px]">
                                              <div>
                                                <span className="text-slate-300 font-semibold">{h.invoiceNumber}</span>
                                                <span className="text-[10px] text-slate-500 block">{h.date} • {h.supplierName}</span>
                                              </div>
                                              <div className="text-right font-mono">
                                                <span className="text-white block font-bold">+{h.quantity} {p.unit}s</span>
                                                <span className="text-slate-500 block">Rate: {formatCurrency(h.unitPrice, true)}</span>
                                              </div>
                                            </div>
                                          ))
                                        ) : (
                                          <p className="text-[11px] text-slate-500 italic">No purchase ledger entries logged yet.</p>
                                        )}
                                      </div>
                                    </div>

                                    <div className="bg-[#09090b]/40 p-4 rounded-xl border border-slate-800/60">
                                      <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 text-brand-cyan animate-pulse" />
                                        Stock Movements Audit Trail
                                      </h5>
                                      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2">
                                        {prodMovements.length > 0 ? (
                                          prodMovements.map((m, i) => (
                                            <div key={i} className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-lg border border-slate-900 text-[11px]">
                                              <div className="flex items-center gap-2">
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                  m.type === 'Purchase' ? 'bg-emerald-500' :
                                                  m.type === 'Sale' ? 'bg-brand-indigo' :
                                                  m.type === 'Adjustment' ? 'bg-amber-500' : 'bg-rose-500'
                                                }`} />
                                                <div>
                                                  <span className="text-slate-300 font-semibold">{m.reference}</span>
                                                  <span className="text-[10px] text-slate-500 block">{m.date} • Operator: {m.user}</span>
                                                </div>
                                              </div>
                                              <div className="text-right font-mono">
                                                <span className={`font-bold block ${m.quantity > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                  {m.quantity > 0 ? `+${m.quantity}` : m.quantity} {p.unit}
                                                </span>
                                                <span className="text-slate-500 block text-[10px]">Stock After: {m.stockAfter}</span>
                                              </div>
                                            </div>
                                          ))
                                        ) : (
                                          <p className="text-[11px] text-slate-500 italic">No movements recorded for this item.</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: PROCUREMENT / PURCHASE ORDERS */}
        {activeTab === 'procurement' && (
          <div className="space-y-6">
            <div className="bg-[#09090b]/40 p-5 rounded-2xl border border-slate-800/60">
              <h2 className="text-lg font-bold text-white mb-2 font-display">Active Purchase Procurement Orders (POs)</h2>
              <p className="text-xs text-slate-400">
                Track open POs submitted to suppliers. Tap Receive to align physical stock arrivals into your digital database.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {purchaseOrders.map((po) => (
                <div key={po.id} className="bg-zinc-900/60 p-5 rounded-xl border border-slate-800 shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-mono text-brand-indigo bg-brand-indigo/10 px-2 py-0.5 rounded border border-brand-indigo/20">
                          {po.poNumber}
                        </span>
                        <h3 className="text-sm font-bold text-white mt-2">{po.supplierName}</h3>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">Date Created: {po.date}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        po.status === 'Pending' 
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      }`}>
                        {po.status}
                      </span>
                    </div>

                    <div className="border-t border-slate-800/40 py-3 space-y-2">
                      <p className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">Line Items:</p>
                      {po.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] bg-zinc-950 p-2 rounded border border-slate-900">
                          <span className="text-slate-300 font-medium">{item.productName}</span>
                          <span className="text-slate-400 font-mono">
                            {item.quantity} Ordered {item.receivedQuantity > 0 && `(Received ${item.receivedQuantity})`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-800/40 pt-4 mt-4">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Total PO Amount:</span>
                      <span className="text-white font-mono font-bold text-sm">{formatCurrency(po.totalAmount, true)}</span>
                    </div>

                    {po.status === 'Pending' ? (
                      <button
                        onClick={() => handleOpenReceivePO(po)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-gray-950 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10"
                      >
                        <PackageCheck className="w-4 h-4" />
                        Receive Order
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <Check className="w-4 h-4" /> Fully Received & Logged
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SUPPLIER ACCOUNTS LEDGER & MASTER */}
        {activeTab === 'supplier' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#09090b]/40 p-5 rounded-2xl border border-slate-800/60">
              <div>
                <h2 className="text-lg font-bold text-white font-display">Supplier Master Database & Ledger</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Track company credentials, payment terms, outstanding balances, and purchase histories for all registered enterprise networks.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSupplierOpen(true)}
                className="px-4 py-2 bg-brand-indigo hover:bg-brand-indigo/90 text-xs font-bold text-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Register New Supplier
              </button>
            </div>

            {/* Supplier Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
                placeholder="Search Supplier Master by Name, GST, Email, Phone..."
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-slate-800/80 rounded-xl text-xs text-white outline-none focus:border-brand-indigo/50 placeholder:text-slate-600"
              />
            </div>

            {/* Supplier Add Form Popup */}
            {isAddSupplierOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-950 p-5 rounded-xl border border-slate-800 space-y-4 text-xs"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                  <span className="font-bold text-white">Enter New Supplier Master Details</span>
                  <button onClick={() => setIsAddSupplierOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">Company Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Chemical Industries"
                      value={addSupCompany}
                      onChange={(e) => setAddSupCompany(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">GSTIN (15-char Tax Code)</label>
                    <input
                      type="text"
                      placeholder="e.g. 07APEXA1111A1Z1"
                      value={addSupGst}
                      onChange={(e) => setAddSupGst(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98765 43210"
                      value={addSupPhone}
                      onChange={(e) => setAddSupPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">Email</label>
                    <input
                      type="email"
                      placeholder="e.g. ops@apexchemical.com"
                      value={addSupEmail}
                      onChange={(e) => setAddSupEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Corporate Warehouse/Office Address</label>
                  <input
                    type="text"
                    placeholder="e.g. A-24, Chemical Zone, Phase II, New Delhi"
                    value={addSupAddress}
                    onChange={(e) => setAddSupAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">Payment Terms</label>
                    <select
                      value={addSupTerms}
                      onChange={(e) => setAddSupTerms(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none cursor-pointer"
                    >
                      <option value="Net 30">Net 30</option>
                      <option value="Net 15">Net 15</option>
                      <option value="Advance">Advance Only</option>
                      <option value="Net 45">Net 45</option>
                    </select>
                  </div>
                  <div className="flex items-end justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddSupplierOpen(false)}
                      className="px-3.5 py-2 bg-zinc-900 border border-slate-800 rounded-lg text-slate-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!addSupCompany) return;
                        const newSup: Supplier = {
                          id: `sup-${Date.now()}`,
                          companyName: addSupCompany,
                          gst: addSupGst || '07AAAAA1111A1Z1',
                          phone: addSupPhone || '+91 98100 12345',
                          email: addSupEmail || `ops@${addSupCompany.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
                          address: addSupAddress || 'Industrial Focal Point, New Delhi',
                          paymentTerms: addSupTerms,
                          outstandingBalance: 0,
                          purchaseHistory: [],
                          productsSupplied: []
                        };
                        setSuppliers(prev => [...prev, newSup]);
                        setAddSupCompany('');
                        setAddSupGst('');
                        setAddSupPhone('');
                        setAddSupEmail('');
                        setAddSupAddress('');
                        setIsAddSupplierOpen(false);
                      }}
                      className="px-4 py-2 bg-brand-indigo hover:bg-brand-indigo/95 rounded-lg text-white font-bold"
                    >
                      Register Supplier
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* List by supplier (Filtered Supplier Master List) */}
            <div className="space-y-6">
              {suppliers.filter(s => {
                const term = supplierSearch.toLowerCase();
                return (
                  s.companyName.toLowerCase().includes(term) ||
                  s.gst.toLowerCase().includes(term) ||
                  (s.phone && s.phone.includes(term)) ||
                  (s.email && s.email.toLowerCase().includes(term)) ||
                  (s.address && s.address.toLowerCase().includes(term))
                );
              }).map((supplier) => {
                const ledger = supplierLedger.filter(l => l.supplierName.toLowerCase() === supplier.companyName.toLowerCase());
                const currentBalance = ledger.length > 0 ? ledger[ledger.length - 1].balance : supplier.outstandingBalance;
                
                return (
                  <div key={supplier.id} className="bg-zinc-900/40 rounded-xl border border-slate-800/80 p-5 shadow-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800/40">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-white">{supplier.companyName}</h3>
                          <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo rounded">
                            {supplier.paymentTerms}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          GSTIN: <span className="font-mono font-semibold text-slate-400">{supplier.gst}</span> • {supplier.email} • {supplier.phone}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          📍 {supplier.address}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Current Outstanding:</span>
                        <span className={`text-lg font-mono font-bold ${currentBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {formatCurrency(currentBalance, true)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      {/* Products Supplied catalog */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Line Materials Supplied:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {supplier.productsSupplied && supplier.productsSupplied.length > 0 ? (
                            supplier.productsSupplied.map((prod, pIdx) => (
                              <span key={pIdx} className="px-2 py-1 bg-zinc-950 border border-slate-900 rounded-lg text-[10px] text-slate-300 font-semibold">
                                {prod}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-500 italic">No associated material product rows registered yet.</span>
                          )}
                        </div>
                      </div>

                      {/* Transaction History ledger */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Purchase Audit History:</p>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {ledger.length > 0 ? (
                            ledger.map((entry) => (
                              <div key={entry.id} className="flex justify-between items-center bg-zinc-950/80 p-2.5 rounded-lg border border-slate-900/60 text-[11px]">
                                <div className="flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    entry.transactionType === 'Bill' ? 'bg-rose-500' : 'bg-emerald-500'
                                  }`} />
                                  <div>
                                    <span className="text-slate-300 font-semibold block">{entry.reference}</span>
                                    <span className="text-[9px] text-slate-500">{entry.date} • {entry.transactionType}</span>
                                  </div>
                                </div>
                                <div className="text-right font-mono">
                                  <span className={`font-bold block ${entry.transactionType === 'Bill' ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {entry.transactionType === 'Bill' ? '+' : '-'}{formatCurrency(entry.amount, true)}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : supplier.purchaseHistory && supplier.purchaseHistory.length > 0 ? (
                            supplier.purchaseHistory.map((invoice, pIdx) => (
                              <div key={pIdx} className="flex justify-between items-center bg-zinc-950/80 p-2.5 rounded-lg border border-slate-900/60 text-[11px]">
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                  <div>
                                    <span className="text-slate-300 font-semibold block">{invoice.invoiceNumber}</span>
                                    <span className="text-[9px] text-slate-500">{invoice.date} • Import</span>
                                  </div>
                                </div>
                                <div className="text-right font-mono">
                                  <span className="font-bold block text-rose-400">
                                    +{formatCurrency(invoice.amount, true)}
                                  </span>
                                  <span className="text-[9px] text-slate-500 font-sans">{invoice.status}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-[11px] text-slate-500 italic py-1">No transaction ledger movements logged.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: MOVEMENT HISTORY TRAIL */}
        {activeTab === 'movements' && (
          <div className="space-y-6">
            <div className="bg-[#09090b]/40 p-5 rounded-2xl border border-slate-800/60 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white mb-2 font-display">System-Wide Inventory Movement Trail</h2>
                <p className="text-xs text-slate-400">
                  Global chronological audit trail of all warehouse stock updates, orders, and AI imports.
                </p>
              </div>
            </div>

            <div className="glass-panel border border-slate-800/60 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-950/60 border-b border-slate-800/60 text-slate-500">
                    <th className="p-4 font-semibold font-mono">TIMESTAMP</th>
                    <th className="p-4 font-semibold font-mono">PRODUCT LINE</th>
                    <th className="p-4 font-semibold font-mono">TRANSACTION TYPE</th>
                    <th className="p-4 font-semibold font-mono">QTY</th>
                    <th className="p-4 font-semibold font-mono">REFERENCE ID</th>
                    <th className="p-4 font-semibold font-mono">OPERATOR / AGENT</th>
                    <th className="p-4 font-semibold font-mono text-right">STOCK AFTER</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id} className="border-b border-slate-800/30 text-slate-300 hover:bg-white/1 transition-colors">
                      <td className="p-4 font-mono text-slate-500">{m.date}</td>
                      <td className="p-4 font-bold text-white">{m.productName}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          m.type === 'Purchase' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                          m.type === 'Sale' ? 'bg-brand-indigo/10 border-brand-indigo/20 text-brand-indigo' :
                          m.type === 'Adjustment' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                          'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}>
                          {m.type}
                        </span>
                      </td>
                      <td className={`p-4 font-mono font-bold ${m.quantity > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </td>
                      <td className="p-4 font-mono text-slate-400">{m.reference}</td>
                      <td className="p-4 text-slate-400 flex items-center gap-1.5">
                        {m.user === 'SAP AI Core Process' && <Sparkles className="w-3.5 h-3.5 text-brand-indigo animate-pulse" />}
                        {m.user}
                      </td>
                      <td className="p-4 font-mono font-bold text-right text-gray-200">{m.stockAfter}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: AI SMART ANALYTICS ADVISOR */}
        {activeTab === 'recommendations' && (
          <div className="space-y-8">
            
            {/* Header with live refresh button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#09090b]/40 p-5 rounded-2xl border border-slate-800/60 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h2 className="text-lg font-bold text-white font-display">Oracle SCM Strategic AI Advisor</h2>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-semibold">
                    Simulated SCM Engine Available (Peak Guard)
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Predictive forecasts, capital locking audits, velocity analytics, and automated restock suggestions. Includes hot-standby rule engine under high-demand 503 peaks.
                </p>
              </div>
              <button
                onClick={refreshAIRecommendations}
                disabled={isRefreshingAI}
                className="px-4 py-2 bg-brand-indigo text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 hover:bg-brand-indigo/90 transition-all disabled:opacity-50"
              >
                {isRefreshingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Run Live Forecast
              </button>
            </div>

            {/* Smart Summary grid cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              
              {/* Card 1: Low Stock alerts */}
              <div className="bg-rose-950/10 border border-rose-500/20 p-5 rounded-xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 text-rose-500">
                  <AlertTriangle className="w-8 h-8 opacity-10" />
                </div>
                <span className="text-[10px] text-rose-400 font-mono tracking-wider block font-bold uppercase">Critical Buffer alerts</span>
                <span className="text-3xl font-extrabold font-mono text-rose-400 block mt-1">
                  {products.filter(p => p.stock <= p.minStock).length}
                </span>
                <p className="text-[11px] text-slate-400 mt-2">Items currently below minimal safety threshold levels.</p>
              </div>

              {/* Card 2: Overstock warning */}
              <div className="bg-amber-950/10 border border-amber-500/20 p-5 rounded-xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 text-amber-500">
                  <TrendingDown className="w-8 h-8 opacity-10" />
                </div>
                <span className="text-[10px] text-amber-400 font-mono tracking-wider block font-bold uppercase">Overstock Capital</span>
                <span className="text-3xl font-extrabold font-mono text-amber-400 block mt-1">
                  {products.filter(p => p.stock > p.minStock * 6).length}
                </span>
                <p className="text-[11px] text-slate-400 mt-2">Items where stock exceed 6x buffers, locking capital.</p>
              </div>

              {/* Card 3: Fast moving items */}
              <div className="bg-emerald-950/10 border border-emerald-500/20 p-5 rounded-xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 text-emerald-500">
                  <TrendingUp className="w-8 h-8 opacity-10" />
                </div>
                <span className="text-[10px] text-emerald-400 font-mono tracking-wider block font-bold uppercase">Fast Moving catalog</span>
                <span className="text-3xl font-extrabold font-mono text-emerald-400 block mt-1">
                  {products.filter(p => p.salesGrowth >= 15).length}
                </span>
                <p className="text-[11px] text-slate-400 mt-2">Items with over 15% monthly sales demand escalation.</p>
              </div>

              {/* Card 4: Slow moving items */}
              <div className="bg-indigo-950/15 border border-brand-indigo/20 p-5 rounded-xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 text-brand-indigo">
                  <RefreshCw className="w-8 h-8 opacity-10" />
                </div>
                <span className="text-[10px] text-indigo-400 font-mono tracking-wider block font-bold uppercase">Sluggish / Slow-Moving</span>
                <span className="text-3xl font-extrabold font-mono text-indigo-400 block mt-1">
                  {products.filter(p => p.salesGrowth < 5).length}
                </span>
                <p className="text-[11px] text-slate-400 mt-2">Catalog units registering less than 5% demand growth.</p>
              </div>

            </div>

            {/* Smart detailed recommendation list */}
            <div className="bg-zinc-900/40 border border-slate-800 p-5 rounded-2xl shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-indigo animate-spin-slow" />
                Itemized Procurement forecasts & action advisor
              </h3>

              <div className="space-y-4">
                {products.map((p) => {
                  const predictedOut = getPredictedStockOutDate(p);
                  const advice = getExecutiveAdvice(p);
                  const isLow = p.stock <= p.minStock;
                  const isOver = p.stock > p.minStock * 6;

                  return (
                    <div key={p.id} className="bg-zinc-950 p-4 rounded-xl border border-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{p.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                            isLow ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            isOver ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {isLow ? 'CRITICAL BUFFER' : isOver ? 'OVERSTOCKED' : 'STABLE LEVEL'}
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{advice}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-slate-500 font-mono">
                          <span>Current Stock: <b className="text-white">{p.stock} {p.unit}s</b></span>
                          <span>Growth Rate: <b className={p.salesGrowth >= 15 ? 'text-emerald-400' : 'text-slate-400'}>{p.salesGrowth}%</b></span>
                          <span>Predicted Stock-out: <b className="text-brand-cyan">{predictedOut}</b></span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isLow ? (
                          <button
                            onClick={() => {
                              onNavigateToCopilot(`Draft a purchase restock order to ${p.supplier} for ${p.minStock * 2} ${p.unit}s of ${p.name}`);
                            }}
                            className="px-3.5 py-2 bg-brand-indigo text-white font-bold rounded-lg cursor-pointer hover:bg-brand-indigo/90 transition-all flex items-center gap-1"
                          >
                            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                            Draft PO
                          </button>
                        ) : isOver ? (
                          <button
                            onClick={() => {
                              onNavigateToCopilot(`Suggest an aggressive pricing promotional plan or bundled paint deal to clear overstocked ${p.name}`);
                            }}
                            className="px-3.5 py-2 bg-zinc-900 border border-slate-800 text-slate-300 font-bold rounded-lg cursor-pointer hover:bg-zinc-800 transition-all flex items-center gap-1"
                          >
                            <TrendingDown className="w-3.5 h-3.5 text-amber-500" />
                            Liquidate Advice
                          </button>
                        ) : (
                          <span className="text-slate-500 flex items-center gap-1 font-mono font-bold text-[11px]">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Balanced
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD PRODUCT FORM MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-950 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6"
          >
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
              <h3 className="text-lg font-bold text-white font-display">Add New Product to ERP Catalog</h3>
              <button 
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Premium White Wall Cement (40kg)"
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:border-brand-indigo outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Sector Category *</label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-slate-800 rounded-lg text-white cursor-pointer outline-none"
                  >
                    <option value="Building Materials">Building Materials</option>
                    <option value="Paints & Coatings">Paints & Coatings</option>
                    <option value="Metal & Structure">Metal & Structure</option>
                    <option value="Timber & Hardware">Timber & Hardware</option>
                    <option value="Tools & Accessories">Tools & Accessories</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Supplier Brand *</label>
                  <select
                    value={newProductForm.supplier}
                    onChange={(e) => setNewProductForm({ ...newProductForm, supplier: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-slate-800 rounded-lg text-white cursor-pointer outline-none"
                  >
                    <option value="Apex Chemical Industries">Apex Chemical Industries</option>
                    <option value="UltraTech Cement Ltd">UltraTech Cement Ltd</option>
                    <option value="Tata Steel Corp">Tata Steel Corp</option>
                    <option value="GreenPly Industries">GreenPly Industries</option>
                    <option value="Sand Miners Syndicate">Sand Miners Syndicate</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Unit Measurement</label>
                  <input
                    type="text"
                    placeholder="e.g. Bag, Tub"
                    value={newProductForm.unit}
                    onChange={(e) => setNewProductForm({ ...newProductForm, unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">HSN Classification Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 3208"
                    value={newProductForm.hsnCode}
                    onChange={(e) => setNewProductForm({ ...newProductForm, hsnCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">GST Rate (%)</label>
                  <input
                    type="number"
                    value={newProductForm.gstRate}
                    onChange={(e) => setNewProductForm({ ...newProductForm, gstRate: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Purchase Cost Price ({symbol}) *</label>
                  <input
                    type="number"
                    required
                    value={newProductForm.cost}
                    onChange={(e) => setNewProductForm({ ...newProductForm, cost: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Retail Selling Price ({symbol}) *</label>
                  <input
                    type="number"
                    required
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Min Reorder Level</label>
                  <input
                    type="number"
                    value={newProductForm.minStock}
                    onChange={(e) => setNewProductForm({ ...newProductForm, minStock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Warehouse Location</label>
                  <input
                    type="text"
                    placeholder="e.g. WH-A3-Shelf2"
                    value={newProductForm.warehouseLocation}
                    onChange={(e) => setNewProductForm({ ...newProductForm, warehouseLocation: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Initial Opening Stock</label>
                  <input
                    type="number"
                    value={newProductForm.stock}
                    onChange={(e) => setNewProductForm({ ...newProductForm, stock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-indigo hover:bg-brand-indigo/90 text-white font-bold rounded-xl transition-all shadow-md shadow-brand-indigo/20 mt-6 cursor-pointer text-xs"
              >
                Commit Product to ERP Database
              </button>

            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: IMPORT PURCHASE INVOICE (AI-POWERED WORKFLOW) */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-950 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-xs"
          >
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20">
                  <Sparkles className="w-5 h-5 text-brand-indigo animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-display">SAP AI Document Extractor</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Automated Invoice Scanner Powered by Gemini 3.5 Flash</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowImportModal(false);
                  setExtractionResult(null);
                  setVerificationData([]);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Peak API Load Safety Notice Banner */}
            <div className="mb-6 p-4 rounded-xl bg-brand-indigo/5 border border-brand-indigo/20 flex gap-3 text-slate-300">
              <Sparkles className="w-5 h-5 text-brand-indigo shrink-0 mt-0.5 animate-spin-slow" />
              <div>
                <p className="font-bold text-white mb-0.5">Dual-Core Operational Redundancy Active</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  During peak global loads on Google GenAI networks (503 status), our integrated <b>High-Fidelity SCM Rule-Based Simulation Engine</b> immediately takes over. This allows you to safely experience and test the complete invoice verification matrix, dynamic product SKU drafting, weighted average cost recalculation, and automated supplier ledger updates seamlessly!
                </p>
              </div>
            </div>

            {/* A: File Uploader Drag and Drop zone */}
            {!extractionResult && !isUploading && (
              <div 
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                  dragActive ? 'border-brand-indigo bg-brand-indigo/5' : 'border-slate-800 hover:border-slate-700 bg-zinc-900/40'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-slate-600 mx-auto mb-4 animate-bounce" />
                <h4 className="text-sm font-bold text-white mb-1.5">Drag & Drop Supplier Invoice here</h4>
                <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed mb-4">
                  Supports scanned PDF copies, camera captured JPG/PNG, and supplier receipts. AI extracts line items automatically.
                </p>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-brand-indigo text-white font-bold rounded-xl text-xs hover:bg-brand-indigo/90 transition-all cursor-pointer shadow-lg shadow-brand-indigo/15"
                >
                  Browse File Directory
                </button>
              </div>
            )}

            {/* B: Loading State with Oracle/SAP credit terms */}
            {/* B: Loading State with Oracle/SAP credit terms and progressive stage indicators */}
            {isUploading && (() => {
              const stages = [
                "Reading Invoice",
                "Detecting Tables",
                "Extracting Products",
                "Matching Inventory",
                "Calculating Inventory Value",
                "Updating Warehouse",
                "Generating AI Insights",
                "Completed"
              ];
              return (
                <div className="text-center py-12 max-w-md mx-auto space-y-6">
                  <div className="relative flex justify-center items-center">
                    <div className="w-16 h-16 border-4 border-slate-800 border-t-brand-indigo rounded-full animate-spin" />
                    <Sparkles className="w-6 h-6 text-brand-indigo absolute animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">SAP Core Document Processing</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Automating enterprise data orchestration</p>
                  </div>
                  
                  <div className="bg-zinc-950 border border-slate-900 rounded-xl p-4 text-left space-y-2.5">
                    {stages.map((text, idx) => {
                      const isDone = idx < loadingStage;
                      const isActive = idx === loadingStage;
                      return (
                        <div key={idx} className="flex items-center justify-between text-[11px] font-mono">
                          <div className="flex items-center gap-2.5">
                            {isDone ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400 font-bold shrink-0" />
                            ) : isActive ? (
                              <div className="w-2 h-2 rounded-full bg-brand-indigo animate-ping shrink-0" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
                            )}
                            <span className={isDone ? 'text-slate-400 line-through decoration-slate-800' : isActive ? 'text-white font-bold animate-pulse' : 'text-slate-600'}>
                              {text}
                            </span>
                          </div>
                          {isDone && <span className="text-emerald-500 text-[9px] font-bold">DONE</span>}
                          {isActive && <span className="text-brand-indigo text-[9px] font-bold animate-pulse">PROCESSING...</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* C: Verification Matrix and commit block */}
            {extractionResult && (
              <div className="space-y-6">
                
                {/* Advanced Multi-Column Financial Dashboard */}
                <div className="bg-zinc-900/60 p-4 rounded-xl border border-slate-800 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="col-span-2">
                    <span className="text-slate-500 font-mono text-[9px] block uppercase tracking-wider">Supplier Name</span>
                    <span className="text-white font-extrabold text-xs block truncate">{extractionResult.supplierName}</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Invoice: <span className="text-brand-cyan">#{extractionResult.invoiceNumber}</span></span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono text-[9px] block uppercase tracking-wider">Billing Date</span>
                    <span className="text-slate-300 font-mono font-bold text-xs">{extractionResult.invoiceDate}</span>
                    <span className="text-[9px] text-emerald-400/80 font-mono block mt-0.5">98.4% OCR Trust</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono text-[9px] block uppercase tracking-wider">Subtotal</span>
                    <span className="text-slate-300 font-mono font-bold text-xs">
                      {formatCurrency(extractionResult.subtotal || (extractionResult.totalAmount - (extractionResult.gst || 0)), true)}
                    </span>
                    {extractionResult.discount > 0 && (
                      <span className="text-[9px] text-rose-400 font-mono block mt-0.5">Discount: -{formatCurrency(extractionResult.discount, true)}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono text-[9px] block uppercase tracking-wider">GST Bracket</span>
                    <span className="text-slate-300 font-mono font-bold text-xs">
                      {formatCurrency(extractionResult.gst || 0, true)}
                    </span>
                    {extractionResult.roundOff !== 0 && (
                      <span className="text-[9px] text-slate-500 font-mono block mt-0.5">Round Off: {extractionResult.roundOff}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono text-[9px] block uppercase tracking-wider">Total Payable (Net)</span>
                    <span className="text-emerald-400 font-mono font-black text-sm block">
                      {formatCurrency(extractionResult.totalAmount, true)}
                    </span>
                    <span className="text-[9px] text-emerald-500 font-mono block mt-0.5">✔ Validated</span>
                  </div>
                </div>

                {/* Product Match Breakdown Summary */}
                <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-slate-800/80 flex flex-wrap gap-6 items-center justify-between text-xs">
                  <div className="flex gap-6">
                    <div>
                      <span className="text-slate-500 font-mono text-[9px] uppercase tracking-wider block">Total Items Found</span>
                      <span className="text-white font-black text-sm block">{verificationData.length}</span>
                    </div>
                    <div className="border-r border-slate-800 self-stretch my-1" />
                    <div>
                      <span className="text-slate-500 font-mono text-[9px] uppercase tracking-wider block">Existing Products Match</span>
                      <span className="text-emerald-400 font-mono font-bold text-sm block">
                        {verificationData.filter(item => item.matchType !== 'new').length} Items
                      </span>
                    </div>
                    <div className="border-r border-slate-800 self-stretch my-1" />
                    <div>
                      <span className="text-slate-500 font-mono text-[9px] uppercase tracking-wider block">New Product Candidates</span>
                      <span className="text-brand-indigo font-mono font-bold text-sm block">
                        {verificationData.filter(item => item.matchType === 'new').length} Items
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono bg-zinc-900 border border-slate-800/50 px-2.5 py-1 rounded-lg">
                    ⚡ AI Auto-drafting candidate properties (Category & SKU) for all new items.
                  </div>
                </div>

                {/* AI VERIFICATION MATRIX */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Dynamic Inventory Match Verification Screen
                    </h4>
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-slate-800 text-slate-400 font-mono text-[10px]">
                      Items Found: <b>{verificationData.length}</b>
                    </span>
                  </div>

                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-950/80 border-b border-slate-800 text-slate-500">
                          <th className="p-3">Extracted Invoice Description</th>
                          <th className="p-3">Matched Catalog SKU & Status</th>
                          <th className="p-3 text-center">Invoiced Qty / Rate</th>
                          <th className="p-3">Current Stock</th>
                          <th className="p-3">Weighted Cost Valuation</th>
                          <th className="p-3 text-right">Commit Stock (Preview)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {verificationData.map((item, idx) => {
                          const isCreated = item.isCreated;
                          const isMatchPossible = item.matchType === 'possible' || item.matchType === 'duplicate';
                          
                          return (
                            <tr key={idx} className={`border-b border-slate-900 text-slate-300 hover:bg-white/1 transition-all ${
                              item.isUncertain && !item.isVerified
                                ? 'bg-amber-500/5 hover:bg-amber-500/10 border-l-2 border-l-amber-500'
                                : 'bg-zinc-950/20'
                            }`}>
                              <td className="p-3">
                                <div className="flex items-start gap-2.5">
                                  <div className="space-y-1">
                                    <span className="font-semibold text-white block">{item.extractedName}</span>
                                    <span className="text-[10px] text-slate-500 font-mono block">HSN: {item.hsnCode} • Unit: {item.unit}</span>
                                    
                                    {/* OCR Extraction Confidence Indicator */}
                                    {item.ocrConfidence !== undefined && (
                                      <div className="flex items-center gap-1.5 mt-1">
                                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                          item.isUncertain 
                                            ? 'bg-rose-500/10 text-rose-400' 
                                            : 'bg-emerald-500/10 text-emerald-400'
                                        }`}>
                                          OCR Match: {item.ocrConfidence}%
                                        </span>
                                        {item.isUncertain && (
                                          <>
                                            {item.isVerified ? (
                                              <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                                Verified
                                              </span>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={() => handleVerifyRow(item.id)}
                                                className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono font-extrabold text-[9px] rounded transition-all cursor-pointer shadow shadow-amber-500/20"
                                              >
                                                Verify Row
                                              </button>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="space-y-1.5">
                                  {/* Badge status */}
                                  {item.matchType === 'exact' ? (
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Existing Product (✓ Increase Stock)</span>
                                    </div>
                                  ) : isMatchPossible ? (
                                    <div className="space-y-1">
                                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        <span>Possible Match ({item.similarity}%)</span>
                                      </div>
                                      {item.similarity < 70 && (
                                        <div className="text-[10px] text-rose-400 font-mono font-bold flex items-center gap-1 mt-0.5">
                                          <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                                          <span>Low Confidence - Please Review</span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-brand-indigo font-bold">
                                      <Sparkles className="w-3 h-3" />
                                      <span>🆕 New Product (Create candidate)</span>
                                    </div>
                                  )}
 
                                  {/* Interactive Choice Toggle for duplicates or ambiguous lines */}
                                  {isMatchPossible && (
                                    <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-slate-800 p-1 rounded-lg w-max mt-1">
                                      <button
                                        type="button"
                                        onClick={() => toggleUserChoice(item.id, 'merge')}
                                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                                          item.userChoice === 'merge'
                                            ? 'bg-emerald-500 text-slate-950'
                                            : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                      >
                                        Merge Stock
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => toggleUserChoice(item.id, 'new')}
                                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                                          item.userChoice === 'new'
                                            ? 'bg-brand-indigo text-white'
                                            : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                      >
                                        Create as New SKU
                                      </button>
                                    </div>
                                  )}
 
                                  {/* Action Setup buttons */}
                                  {item.userChoice === 'new' && (
                                    <div className="mt-1">
                                      {isCreated ? (
                                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                          <span>SKU Drafted: <b>{item.createdProduct.name}</b></span>
                                          <button
                                            type="button"
                                            onClick={() => triggerCreateNewProduct(item)}
                                            className="text-brand-indigo hover:underline font-bold"
                                          >
                                            Edit SKU
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => triggerCreateNewProduct(item)}
                                          className="px-2 py-1 rounded bg-brand-indigo text-white font-mono font-bold hover:bg-brand-indigo/90 transition-all cursor-pointer flex items-center gap-1 text-[10px] mt-1"
                                        >
                                          <Plus className="w-3.5 h-3.5" />
                                          Setup Catalog SKU
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-center font-mono font-bold">
                                <div>{item.incomingQty} {item.unit}</div>
                                <div className="text-[10px] text-slate-500">@ {formatCurrency(item.incomingPrice, true)}</div>
                              </td>
                              <td className="p-3 font-mono text-slate-400">
                                {item.userChoice === 'merge' ? `${item.currentStock} ${item.unit}s` : '—'}
                              </td>
                              <td className="p-3 font-mono">
                                {item.userChoice === 'new' ? (
                                  <div className="text-[10px]">
                                    <span className="text-slate-500 block uppercase tracking-wider text-[8px]">New initial cost</span>
                                    <span className="text-brand-cyan font-bold block">{formatCurrency(item.incomingPrice, true)}</span>
                                  </div>
                                ) : (
                                  <div className="text-[10px]">
                                    <span className="text-slate-500 block line-through">Prev: {formatCurrency(item.currentCost, true)}</span>
                                    <span className="text-emerald-400 block font-bold">New Avg: {formatCurrency(item.newCost, true)}</span>
                                  </div>
                                )}
                              </td>
                              <td className="p-3 font-mono font-extrabold text-right text-emerald-400">
                                {item.userChoice === 'new' && !isCreated ? (
                                  <span className="text-slate-500 font-mono text-[10px] italic">Draft SKU first</span>
                                ) : (
                                  <span className="flex items-center justify-end gap-1">
                                    {item.currentStock} <ArrowRight className="w-3 h-3 text-slate-600" /> {item.newStock}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {ocrError && (
                  <div className="bg-rose-950/10 border border-rose-500/20 p-3.5 rounded-lg flex items-center gap-2 text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{ocrError}</span>
                  </div>
                )}

                {/* Confirm committing to digital books */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setExtractionResult(null);
                      setVerificationData([]);
                    }}
                    className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                  >
                    Re-scan File
                  </button>
                  
                  <button
                    onClick={handleCommitInvoice}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-extrabold rounded-xl cursor-pointer flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10"
                  >
                    <PackagePlus className="w-4 h-4" />
                    Commit Invoice & Increase Stock
                  </button>
                </div>

              </div>
            )}

          </motion.div>
        </div>
      )}

      {/* AI-GENERATED PRODUCT CREATION DRAWER SUB-DIALOG */}
      {newProductToCreate && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 text-xs">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-950 border border-brand-indigo/30 rounded-2xl w-full max-w-lg shadow-2xl p-6"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-indigo" />
                <h3 className="text-base font-bold text-white font-display">AI Product Generator Setup</h3>
              </div>
              <button 
                onClick={() => setNewProductToCreate(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

             <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Product Name (Extracted Guess)</label>
                  <input
                    type="text"
                    required
                    value={newProductToCreate.name}
                    onChange={(e) => setNewProductToCreate({ ...newProductToCreate, name: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Internal SKU (Auto Generated)</label>
                  <input
                    type="text"
                    required
                    value={newProductToCreate.sku || ''}
                    onChange={(e) => setNewProductToCreate({ ...newProductToCreate, sku: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-slate-800 rounded-lg text-brand-cyan font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Sector Category</label>
                  <select
                    value={newProductToCreate.category}
                    onChange={(e) => setNewProductToCreate({ ...newProductToCreate, category: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none cursor-pointer"
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Paints & Coatings">Paints & Coatings</option>
                    <option value="Metal & Structure">Metal & Structure</option>
                    <option value="Timber & Hardware">Timber & Hardware</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing & Sanitary">Plumbing & Sanitary</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Building Materials">Building Materials</option>
                    <option value="Tools & Accessories">Tools & Accessories</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Supplier Brand</label>
                  <input
                    type="text"
                    required
                    value={newProductToCreate.supplier}
                    onChange={(e) => setNewProductToCreate({ ...newProductToCreate, supplier: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Unit</label>
                  <input
                    type="text"
                    value={newProductToCreate.unit}
                    onChange={(e) => setNewProductToCreate({ ...newProductToCreate, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">HSN</label>
                  <input
                    type="text"
                    value={newProductToCreate.hsnCode}
                    onChange={(e) => setNewProductToCreate({ ...newProductToCreate, hsnCode: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">GST Rate (%)</label>
                  <input
                    type="number"
                    value={newProductToCreate.gstRate}
                    onChange={(e) => setNewProductToCreate({ ...newProductToCreate, gstRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Cost Price ({symbol})</label>
                  <input
                    type="number"
                    value={newProductToCreate.cost}
                    onChange={(e) => setNewProductToCreate({ ...newProductToCreate, cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Selling Price ({symbol})</label>
                  <input
                    type="number"
                    value={newProductToCreate.price}
                    onChange={(e) => setNewProductToCreate({ ...newProductToCreate, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Reorder Level</label>
                  <input
                    type="number"
                    value={newProductToCreate.minStock}
                    onChange={(e) => setNewProductToCreate({ ...newProductToCreate, minStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Location</label>
                  <input
                    type="text"
                    value={newProductToCreate.warehouseLocation}
                    onChange={(e) => setNewProductToCreate({ ...newProductToCreate, warehouseLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Initial Stock</label>
                  <input
                    type="number"
                    value={newProductToCreate.stock}
                    onChange={(e) => setNewProductToCreate({ ...newProductToCreate, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-slate-800 rounded-lg text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveAIProduct}
                className="w-full py-2.5 bg-brand-indigo hover:bg-brand-indigo/90 text-white font-bold rounded-xl mt-4 cursor-pointer"
              >
                Verify & Add to Verification Stream
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL 3: RECEIVE PURCHASE ORDER FORM */}
      {showReceiveModal && selectedPO && (
        <ReceivePOModal
          po={selectedPO}
          onClose={() => {
            setShowReceiveModal(false);
            setSelectedPO(null);
          }}
          onConfirm={commitPOReceipt}
          symbol={symbol}
        />
      )}

    </div>
  );
}

// Subcomponent: Receive Purchase Order modal
interface ReceivePOModalProps {
  po: PurchaseOrder;
  onClose: () => void;
  onConfirm: (receivedQtys: { [key: string]: number }) => void;
  symbol: string;
}

function ReceivePOModal({ po, onClose, onConfirm, symbol }: ReceivePOModalProps) {
  const [receivedQtys, setReceivedQtys] = useState<{ [key: string]: number }>(() => {
    const qtys: { [key: string]: number } = {};
    po.items.forEach(item => {
      qtys[item.productName] = item.quantity;
    });
    return qtys;
  });

  const handleQtyChange = (name: string, val: number) => {
    setReceivedQtys(prev => ({ ...prev, [name]: val }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 text-xs text-slate-300">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-950 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-6"
      >
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white font-display">Receive Delivery for PO {po.poNumber}</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Supplier: {po.supplierName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-slate-400">
            Specify the precise quantity physically received at the warehouse loading docks. Unreceived quantities will trigger supply discrepancy logs.
          </p>

          <div className="space-y-3">
            {po.items.map((item, idx) => (
              <div key={idx} className="bg-zinc-900/60 p-4 rounded-xl border border-slate-800 flex justify-between items-center gap-4">
                <div className="flex-1">
                  <span className="font-bold text-white text-sm block">{item.productName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Ordered: {item.quantity} {item.unit}s @ {formatCurrency(item.price, true)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-mono text-slate-500">RECEIVED QTY:</label>
                  <input
                    type="number"
                    min={0}
                    max={item.quantity}
                    value={receivedQtys[item.productName]}
                    onChange={(e) => handleQtyChange(item.productName, Number(e.target.value))}
                    className="w-20 px-2.5 py-1.5 bg-zinc-950 border border-slate-800 rounded text-center text-white outline-none font-mono font-bold"
                  />
                  <span className="text-slate-400 font-mono">{item.unit}s</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(receivedQtys)}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all shadow-lg"
          >
            <PackageCheck className="w-4.5 h-4.5" />
            Commit & Update Stock Level
          </button>
        </div>
      </motion.div>
    </div>
  );
}
