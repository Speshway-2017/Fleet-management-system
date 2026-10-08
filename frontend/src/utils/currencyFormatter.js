/**
 * Safely parses any value (number, string with currency/commas/units, array of values, null, undefined)
 * into a valid primitive JavaScript number in exact base units (Rupees).
 */
export const parseNumericValue = (val) => {
  if (val === null || val === undefined || val === "") return 0;

  if (typeof val === "number") {
    if (isNaN(val) || !isFinite(val)) return 0;
    return val;
  }

  if (typeof val === "string") {
    // If the string contains Cr or Crore, e.g. "1.5 Cr", convert to exact rupees
    const isCrore = /cr(?:ore)?s?/i.test(val);
    const isLakh = /l(?:akh)?s?/i.test(val);
    const isThousand = /\b\d+(\.\d+)?k\b/i.test(val);

    const cleaned = val.replace(/[^0-9.-]/g, "");
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed) || !isFinite(parsed)) return 0;

    if (isCrore && parsed < 1e7) {
      return parsed * 1e7;
    }
    if (isLakh && parsed < 1e5) {
      return parsed * 1e5;
    }
    if (isThousand && parsed < 1e3) {
      return parsed * 1e3;
    }
    return parsed;
  }

  if (Array.isArray(val)) {
    // If an array is passed, sum valid numeric items cleanly
    return val.reduce((acc, curr) => acc + parseNumericValue(curr), 0);
  }
  if (typeof val === "object") {
    // If an object with a numeric 'value' or 'total' or 'revenue' field is passed
    if ("value" in val) return parseNumericValue(val.value);
    if ("total" in val) return parseNumericValue(val.total);
    if ("revenue" in val) return parseNumericValue(val.revenue);
  }
  return 0;
};

/**
 * Formats a given value into compact Indian Currency notation (INR).
 * Converts to Crores, Lakhs, or locale-formatted thousands only once for display.
 * Never outputs exponential scientific notation (e.g. 1.08e+107 Cr).
 * Examples:
 * - 0 -> "₹0"
 * - 5,000 -> "₹5,000"
 * - 93,16,443 -> "₹93.16 L"
 * - 1,00,00,000 -> "₹1 Cr"
 * - 10,00,00,000 -> "₹10 Cr"
 * - 100,00,00,000 -> "₹100 Cr"
 * - 200,00,00,00,000 -> "₹20,000 Cr"
 */
export const formatCompactCurrency = (val) => {
  const num = parseNumericValue(val);
  if (!num || num === 0) return "₹0";

  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const prefix = isNegative ? "-₹" : "₹";

  // Crores: >= 1 Crore (1e7 = 1,00,00,000)
  if (absNum >= 1e7) {
    const crores = absNum / 1e7;
    let formatted;
    if (crores >= 1000) {
      formatted = Math.round(crores).toLocaleString("en-IN");
    } else {
      formatted = crores % 1 === 0 ? crores.toFixed(0) : parseFloat(crores.toFixed(2)).toString();
    }
    return `${prefix}${formatted} Cr`;
  }

  // Lakhs: >= 1 Lakh (1e5 = 1,00,000)
  if (absNum >= 1e5) {
    const lakhs = absNum / 1e5;
    const formatted = lakhs % 1 === 0 ? lakhs.toFixed(0) : parseFloat(lakhs.toFixed(2)).toString();
    return `${prefix}${formatted} L`;
  }

  // Standard numbers (< 1 Lakh)
  return `${prefix}${Math.round(absNum).toLocaleString("en-IN")}`;
};

/**
 * Formats a value into full uncompact Indian Rupee format (e.g., ₹10,00,000).
 */
export const formatFullCurrency = (val) => {
  const num = parseNumericValue(val);
  if (!num || num === 0) return "₹0";

  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const prefix = isNegative ? "-₹" : "₹";

  if (absNum <= Number.MAX_SAFE_INTEGER) {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(num);
    } catch (_) {
      return `${prefix}${Math.round(absNum).toLocaleString("en-IN")}`;
    }
  }

  return formatCompactCurrency(val);
};

/**
 * Main currency formatter for platform components, dashboard cards, reports, and charts.
 * By default uses compact Indian currency notation for large values while preserving ₹0.
 */
export const formatCurrency = (val, options = {}) => {
  if (options && options.full) {
    return formatFullCurrency(val);
  }
  return formatCompactCurrency(val);
};
