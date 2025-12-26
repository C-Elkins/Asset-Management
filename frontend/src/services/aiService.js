import { api } from "./api.js";

/**
 * AI Assistant Service
 * Powers intelligent asset management features
 */
export const aiService = {
  /**
   * Analyze asset details and suggest category, brand detection, etc.
   * @param {Object} assetData - Partial asset information
   * @returns {Promise<Object>} AI suggestions
   */
  async analyzeAsset(assetData) {
    try {
      const { data } = await api.post("/ai/analyze-asset", assetData);
      return data;
    } catch (error) {
      // Silently fall back to client-side intelligence
      // Backend AI endpoints not yet implemented
      if (error.response?.status === 403 || error.response?.status === 404) {
        // Expected - using fallback
      } else {
        console.warn("AI analysis unavailable, using fallback:", error.message);
      }
      return this.getFallbackSuggestions(assetData);
    }
  },

  /**
   * Get smart field suggestions based on partial input
   */
  async getFieldSuggestions(field, value, context = {}) {
    try {
      const { data } = await api.post("/ai/suggest", {
        field,
        value,
        context,
      });
      return data.suggestions || [];
    } catch (error) {
      // Backend endpoint not available yet
      return [];
    }
  },

  /**
   * Predict maintenance needs based on asset data
   */
  async predictMaintenance(assetId) {
    try {
      const { data } = await api.get(`/ai/predict-maintenance/${assetId}`);
      return data;
    } catch (error) {
      // Backend endpoint not available yet
      return null;
    }
  },

  /**
   * Generate asset insights and recommendations
   */
  async generateInsights(filters = {}) {
    try {
      const { data } = await api.post("/ai/insights", filters);
      return data;
    } catch (error) {
      // Backend endpoint not available yet - return sample insights
      return {
        insights: [
          {
            title: "Asset Inventory Growing",
            description:
              "Your asset inventory is expanding. Consider reviewing your categories.",
            priority: "medium",
          },
          {
            title: "Maintenance Schedule",
            description:
              "Set up maintenance schedules for better asset lifecycle management.",
            priority: "low",
          },
        ],
      };
    }
  },

  /**
   * Detect trends in asset data
   */
  async detectTrends(timeRange = "30days") {
    try {
      const { data } = await api.get(`/ai/trends?range=${timeRange}`);
      return data;
    } catch (error) {
      // Backend endpoint not available yet
      return null;
    }
  },

  /**
   * Smart search with natural language
   */
  async smartSearch(query) {
    try {
      const { data } = await api.post("/ai/smart-search", { query });
      return data;
    } catch (error) {
      // Backend endpoint not available yet
      return [];
    }
  },

  /**
   * Client-side fallback suggestions (when API is unavailable)
   */
  getFallbackSuggestions(assetData) {
    const { name = "", brand = "", model = "", description = "" } = assetData;
    const input = `${name} ${brand} ${model} ${description}`.toLowerCase();

    // Enhanced brand detection patterns with model recognition
    const brandPatterns = {
      // Technology - Computers
      apple: {
        category: "Computers",
        confidence: 0.95,
        brands: [
          "apple",
          "macbook",
          "imac",
          "mac mini",
          "mac pro",
          "mac studio",
        ],
        models: [
          "air",
          "pro",
          "m1",
          "m2",
          "m3",
          "13-inch",
          "14-inch",
          "15-inch",
          "16-inch",
        ],
        location: "IT Department",
        warrantyMonths: 12,
      },
      dell: {
        category: "Computers",
        confidence: 0.95,
        brands: [
          "dell",
          "latitude",
          "precision",
          "optiplex",
          "xps",
          "inspiron",
        ],
        models: ["5000", "7000", "9000", "tower", "sff"],
        location: "IT Department",
        warrantyMonths: 36,
      },
      hp: {
        category: "Computers",
        confidence: 0.95,
        brands: ["hp", "elitebook", "probook", "pavilion", "envy", "omen"],
        models: ["x360", "g8", "g9", "840", "850"],
        location: "IT Department",
        warrantyMonths: 36,
      },
      lenovo: {
        category: "Computers",
        confidence: 0.95,
        brands: ["lenovo", "thinkpad", "ideapad", "yoga", "legion"],
        models: ["x1", "t14", "t15", "p1", "carbon"],
        location: "IT Department",
        warrantyMonths: 36,
      },
      microsoft: {
        category: "Computers",
        confidence: 0.9,
        brands: ["microsoft", "surface"],
        models: ["pro", "laptop", "book", "studio", "go"],
        location: "IT Department",
        warrantyMonths: 12,
      },

      // Network Equipment
      cisco: {
        category: "Network Equipment",
        confidence: 0.95,
        brands: ["cisco", "catalyst", "meraki", "nexus"],
        models: ["2960", "3850", "9300", "mx", "ms", "mr"],
        location: "Server Room",
        warrantyMonths: 36,
      },
      ubiquiti: {
        category: "Network Equipment",
        confidence: 0.95,
        brands: ["ubiquiti", "unifi", "edgerouter"],
        models: ["ap", "switch", "dream machine", "udm"],
        location: "Server Room",
        warrantyMonths: 12,
      },

      // Mobile Devices
      samsung: {
        category: "Mobile Devices",
        confidence: 0.95,
        brands: ["samsung", "galaxy"],
        models: ["s23", "s24", "note", "fold", "flip", "tab"],
        location: "IT Department",
        warrantyMonths: 12,
      },
      google: {
        category: "Mobile Devices",
        confidence: 0.9,
        brands: ["google", "pixel"],
        models: ["7", "8", "pro", "fold"],
        location: "IT Department",
        warrantyMonths: 12,
      },

      // Automotive
      toyota: {
        category: "Vehicles",
        confidence: 0.95,
        brands: [
          "toyota",
          "camry",
          "corolla",
          "rav4",
          "highlander",
          "tacoma",
          "tundra",
        ],
        models: ["le", "se", "xle", "xse", "limited", "trd"],
        location: "Fleet Parking",
        warrantyMonths: 36,
      },
      ford: {
        category: "Vehicles",
        confidence: 0.95,
        brands: ["ford", "f-150", "mustang", "explorer", "escape", "ranger"],
        models: ["xl", "xlt", "lariat", "king ranch", "platinum", "raptor"],
        location: "Fleet Parking",
        warrantyMonths: 36,
      },
      honda: {
        category: "Vehicles",
        confidence: 0.95,
        brands: ["honda", "civic", "accord", "cr-v", "pilot", "odyssey"],
        models: ["lx", "sport", "ex", "touring", "elite"],
        location: "Fleet Parking",
        warrantyMonths: 36,
      },
      chevrolet: {
        category: "Vehicles",
        confidence: 0.95,
        brands: ["chevrolet", "chevy", "silverado", "equinox", "traverse"],
        models: ["wt", "lt", "rst", "ltz", "premier", "high country"],
        location: "Fleet Parking",
        warrantyMonths: 36,
      },

      // Medical Equipment
      philips: {
        category: "Medical Devices",
        confidence: 0.9,
        brands: ["philips", "healthcare"],
        models: ["intellivue", "pagewriter", "respironics"],
        location: "Medical Ward",
        warrantyMonths: 12,
      },
      ge: {
        category: "Medical Devices",
        confidence: 0.85,
        brands: ["ge", "general electric", "healthcare"],
        models: ["dash", "vivid", "logiq", "versana"],
        location: "Medical Ward",
        warrantyMonths: 12,
      },
      siemens: {
        category: "Medical Devices",
        confidence: 0.9,
        brands: ["siemens", "healthineers"],
        models: ["acuson", "somatom", "magnetom"],
        location: "Medical Ward",
        warrantyMonths: 12,
      },

      // Manufacturing & Tools
      caterpillar: {
        category: "Machinery",
        confidence: 0.95,
        brands: ["caterpillar", "cat"],
        models: ["320", "330", "excavator", "dozer", "loader"],
        location: "Equipment Yard",
        warrantyMonths: 24,
      },
      john_deere: {
        category: "Machinery",
        confidence: 0.95,
        brands: ["john deere", "deere"],
        models: ["gator", "tractor", "combine", "5e", "6m"],
        location: "Equipment Yard",
        warrantyMonths: 24,
      },
      bosch: {
        category: "Tools",
        confidence: 0.9,
        brands: ["bosch"],
        models: ["gbh", "gws", "gsr", "professional"],
        location: "Tool Storage",
        warrantyMonths: 12,
      },
      dewalt: {
        category: "Tools",
        confidence: 0.95,
        brands: ["dewalt"],
        models: ["20v", "60v", "flexvolt", "xr"],
        location: "Tool Storage",
        warrantyMonths: 36,
      },
      milwaukee: {
        category: "Tools",
        confidence: 0.95,
        brands: ["milwaukee"],
        models: ["m12", "m18", "fuel", "redlithium"],
        location: "Tool Storage",
        warrantyMonths: 36,
      },

      // Printers & Copiers
      canon: {
        category: "Printers",
        confidence: 0.95,
        brands: ["canon", "imageclass", "pixma"],
        models: ["mf", "mb", "lbp", "tr"],
        location: "Office",
        warrantyMonths: 12,
      },
      epson: {
        category: "Printers",
        confidence: 0.95,
        brands: ["epson", "ecotank", "workforce"],
        models: ["et", "wf", "l"],
        location: "Office",
        warrantyMonths: 12,
      },
    };

    // Detect brand, category, and model
    let detectedBrand = null;
    let detectedModel = null;
    let suggestedCategory = null;
    let suggestedLocation = null;
    let suggestedWarrantyMonths = null;
    let confidence = 0;

    for (const [key, pattern] of Object.entries(brandPatterns)) {
      if (pattern.brands.some((b) => input.includes(b))) {
        detectedBrand = brand || key.replace(/_/g, " ").toUpperCase();
        suggestedCategory = pattern.category;
        suggestedLocation = pattern.location;
        suggestedWarrantyMonths = pattern.warrantyMonths;
        confidence = pattern.confidence;

        // Try to detect model
        if (pattern.models) {
          for (const m of pattern.models) {
            if (input.includes(m)) {
              detectedModel = model || m.toUpperCase();
              confidence = Math.min(confidence + 0.05, 1.0); // Boost confidence if model detected
              break;
            }
          }
        }
        break;
      }
    }

    // Keyword-based category detection (fallback)
    if (!suggestedCategory) {
      const categoryKeywords = {
        Computers: [
          "laptop",
          "computer",
          "desktop",
          "pc",
          "macbook",
          "chromebook",
          "workstation",
        ],
        "Mobile Devices": [
          "phone",
          "tablet",
          "ipad",
          "smartphone",
          "mobile",
          "android",
          "ios",
        ],
        Monitors: ["monitor", "display", "screen", "lcd", "led", "oled"],
        Printers: ["printer", "scanner", "copier", "mfp", "multifunction"],
        "Network Equipment": [
          "router",
          "switch",
          "firewall",
          "access point",
          "network",
          "ap",
          "modem",
        ],
        Servers: ["server", "rack", "blade", "nas", "storage"],
        Vehicles: ["car", "truck", "van", "vehicle", "suv", "sedan", "pickup"],
        "Medical Devices": [
          "monitor",
          "pump",
          "ventilator",
          "defibrillator",
          "ultrasound",
          "patient",
          "medical",
        ],
        Tools: ["drill", "saw", "wrench", "tool", "equipment", "power tool"],
        Furniture: ["desk", "chair", "table", "cabinet", "shelf", "storage"],
        "Office Equipment": [
          "projector",
          "whiteboard",
          "shredder",
          "laminator",
        ],
      };

      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some((k) => input.includes(k))) {
          suggestedCategory = category;
          confidence = 0.7;
          suggestedLocation = this.getDefaultLocation(category);
          break;
        }
      }
    }

    return {
      category: suggestedCategory,
      brand: detectedBrand || brand,
      model: detectedModel || model,
      confidence,
      suggestedLocation,
      suggestedWarrantyMonths,
      suggestions: {
        description: this.generateDescription(
          assetData,
          suggestedCategory,
          detectedBrand,
          detectedModel,
        ),
        tags: this.generateTags(assetData, suggestedCategory, detectedBrand),
      },
    };
  },

  getDefaultLocation(category) {
    const locationMap = {
      Computers: "IT Department",
      "Mobile Devices": "IT Department",
      Monitors: "IT Department",
      Printers: "Office",
      "Network Equipment": "Server Room",
      Servers: "Server Room",
      Vehicles: "Fleet Parking",
      "Medical Devices": "Medical Ward",
      Tools: "Tool Storage",
      Furniture: "Office",
      Machinery: "Equipment Yard",
      "Office Equipment": "Office",
    };
    return locationMap[category] || "Storage";
  },

  generateDescription(assetData, category, detectedBrand, detectedModel) {
    const { name, brand, model } = assetData;
    const finalBrand = detectedBrand || brand;
    const finalModel = detectedModel || model;

    if (finalBrand && finalModel) {
      return `${finalBrand} ${finalModel} ${category || "Asset"} - Professional grade equipment`;
    }
    if (finalBrand) {
      return `${finalBrand} ${category || "Asset"} - Quality equipment for daily operations`;
    }
    if (name) {
      return `${name} - ${category || "Asset"} for business use`;
    }
    return "";
  },

  generateTags(assetData, category, detectedBrand) {
    const tags = [];
    if (category) tags.push(category.toLowerCase().replace(/\s+/g, "-"));
    if (detectedBrand || assetData.brand)
      tags.push((detectedBrand || assetData.brand).toLowerCase());
    if (assetData.model) tags.push(assetData.model.toLowerCase());
    return tags;
  },
};

export default aiService;
