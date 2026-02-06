// Country to Currency mapping (ISO 3166-1 alpha-2 to ISO 4217)
// This provides a static mapping without needing external API calls

export interface CurrencyInfo {
  code: string;      // ISO 4217 currency code
  symbol: string;    // Currency symbol
  name: string;      // Currency name
}

// Comprehensive country to currency mapping
const COUNTRY_CURRENCY_MAP: Record<string, CurrencyInfo> = {
  // North America
  "US": { code: "USD", symbol: "$", name: "US Dollar" },
  "CA": { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  "MX": { code: "MXN", symbol: "$", name: "Mexican Peso" },

  // Europe
  "GB": { code: "GBP", symbol: "£", name: "British Pound" },
  "UK": { code: "GBP", symbol: "£", name: "British Pound" }, // Alternative code
  "DE": { code: "EUR", symbol: "€", name: "Euro" },
  "FR": { code: "EUR", symbol: "€", name: "Euro" },
  "IT": { code: "EUR", symbol: "€", name: "Euro" },
  "ES": { code: "EUR", symbol: "€", name: "Euro" },
  "NL": { code: "EUR", symbol: "€", name: "Euro" },
  "BE": { code: "EUR", symbol: "€", name: "Euro" },
  "AT": { code: "EUR", symbol: "€", name: "Euro" },
  "IE": { code: "EUR", symbol: "€", name: "Euro" },
  "PT": { code: "EUR", symbol: "€", name: "Euro" },
  "GR": { code: "EUR", symbol: "€", name: "Euro" },
  "FI": { code: "EUR", symbol: "€", name: "Euro" },
  "CH": { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  "SE": { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  "NO": { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  "DK": { code: "DKK", symbol: "kr", name: "Danish Krone" },
  "PL": { code: "PLN", symbol: "zł", name: "Polish Zloty" },
  "CZ": { code: "CZK", symbol: "Kč", name: "Czech Koruna" },
  "HU": { code: "HUF", symbol: "Ft", name: "Hungarian Forint" },
  "RO": { code: "RON", symbol: "lei", name: "Romanian Leu" },
  "RU": { code: "RUB", symbol: "₽", name: "Russian Ruble" },
  "UA": { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia" },
  "TR": { code: "TRY", symbol: "₺", name: "Turkish Lira" },

  // Asia
  "IN": { code: "INR", symbol: "₹", name: "Indian Rupee" },
  "CN": { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  "JP": { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  "KR": { code: "KRW", symbol: "₩", name: "South Korean Won" },
  "SG": { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  "HK": { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  "TW": { code: "TWD", symbol: "NT$", name: "New Taiwan Dollar" },
  "TH": { code: "THB", symbol: "฿", name: "Thai Baht" },
  "MY": { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  "ID": { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  "PH": { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  "VN": { code: "VND", symbol: "₫", name: "Vietnamese Dong" },
  "PK": { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
  "BD": { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
  "LK": { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee" },
  "NP": { code: "NPR", symbol: "₨", name: "Nepalese Rupee" },

  // Middle East
  "AE": { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  "SA": { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  "QA": { code: "QAR", symbol: "﷼", name: "Qatari Riyal" },
  "KW": { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar" },
  "BH": { code: "BHD", symbol: "BD", name: "Bahraini Dinar" },
  "OM": { code: "OMR", symbol: "﷼", name: "Omani Rial" },
  "IL": { code: "ILS", symbol: "₪", name: "Israeli Shekel" },
  "JO": { code: "JOD", symbol: "JD", name: "Jordanian Dinar" },
  "EG": { code: "EGP", symbol: "£", name: "Egyptian Pound" },

  // Oceania
  "AU": { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  "NZ": { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },

  // South America
  "BR": { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  "AR": { code: "ARS", symbol: "$", name: "Argentine Peso" },
  "CL": { code: "CLP", symbol: "$", name: "Chilean Peso" },
  "CO": { code: "COP", symbol: "$", name: "Colombian Peso" },
  "PE": { code: "PEN", symbol: "S/", name: "Peruvian Sol" },
  "VE": { code: "VES", symbol: "Bs", name: "Venezuelan Bolivar" },

  // Africa
  "ZA": { code: "ZAR", symbol: "R", name: "South African Rand" },
  "NG": { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  "KE": { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  "GH": { code: "GHS", symbol: "₵", name: "Ghanaian Cedi" },
  "MA": { code: "MAD", symbol: "د.م.", name: "Moroccan Dirham" },
  "TN": { code: "TND", symbol: "د.ت", name: "Tunisian Dinar" },
};

// Common country name to code mapping for flexibility
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  "united states": "US",
  "usa": "US",
  "united states of america": "US",
  "canada": "CA",
  "mexico": "MX",
  "united kingdom": "GB",
  "uk": "GB",
  "england": "GB",
  "germany": "DE",
  "france": "FR",
  "italy": "IT",
  "spain": "ES",
  "netherlands": "NL",
  "belgium": "BE",
  "austria": "AT",
  "ireland": "IE",
  "portugal": "PT",
  "greece": "GR",
  "finland": "FI",
  "switzerland": "CH",
  "sweden": "SE",
  "norway": "NO",
  "denmark": "DK",
  "poland": "PL",
  "czech republic": "CZ",
  "hungary": "HU",
  "romania": "RO",
  "russia": "RU",
  "ukraine": "UA",
  "turkey": "TR",
  "india": "IN",
  "in": "IN",  // Handle if "IN" is stored as country name
  "china": "CN",
  "japan": "JP",
  "south korea": "KR",
  "korea": "KR",
  "singapore": "SG",
  "hong kong": "HK",
  "taiwan": "TW",
  "thailand": "TH",
  "malaysia": "MY",
  "indonesia": "ID",
  "philippines": "PH",
  "vietnam": "VN",
  "pakistan": "PK",
  "bangladesh": "BD",
  "sri lanka": "LK",
  "nepal": "NP",
  "uae": "AE",
  "united arab emirates": "AE",
  "saudi arabia": "SA",
  "qatar": "QA",
  "kuwait": "KW",
  "bahrain": "BH",
  "oman": "OM",
  "israel": "IL",
  "jordan": "JO",
  "egypt": "EG",
  "australia": "AU",
  "new zealand": "NZ",
  "brazil": "BR",
  "argentina": "AR",
  "chile": "CL",
  "colombia": "CO",
  "peru": "PE",
  "venezuela": "VE",
  "south africa": "ZA",
  "nigeria": "NG",
  "kenya": "KE",
  "ghana": "GH",
  "morocco": "MA",
  "tunisia": "TN",
};

/**
 * Get currency information from a country code or name
 * @param countryInput - ISO 3166-1 alpha-2 code (e.g., "US", "IN") or country name
 * @returns CurrencyInfo or default USD if not found
 */
export function getCurrencyFromCountry(countryInput: string | null | undefined): CurrencyInfo {
  if (!countryInput) {
    return { code: "USD", symbol: "$", name: "US Dollar" };
  }

  // Normalize input
  const normalized = countryInput.trim().toUpperCase();
  
  // Try direct code match first
  if (COUNTRY_CURRENCY_MAP[normalized]) {
    return COUNTRY_CURRENCY_MAP[normalized];
  }

  // Try country name lookup
  const lowerInput = countryInput.trim().toLowerCase();
  const countryCode = COUNTRY_NAME_TO_CODE[lowerInput];
  if (countryCode && COUNTRY_CURRENCY_MAP[countryCode]) {
    return COUNTRY_CURRENCY_MAP[countryCode];
  }

  // Default to USD
  return { code: "USD", symbol: "$", name: "US Dollar" };
}

/**
 * Get list of all supported countries with their currencies
 */
export function getAllCountriesWithCurrencies(): Array<{ code: string; name: string; currency: CurrencyInfo }> {
  const countries: Array<{ code: string; name: string; currency: CurrencyInfo }> = [];
  
  // Reverse lookup from COUNTRY_NAME_TO_CODE
  const codeToName: Record<string, string> = {};
  for (const [name, code] of Object.entries(COUNTRY_NAME_TO_CODE)) {
    if (!codeToName[code] || name.length > codeToName[code].length) {
      // Use the longer/more complete name
      codeToName[code] = name;
    }
  }

  for (const [code, currency] of Object.entries(COUNTRY_CURRENCY_MAP)) {
    const name = codeToName[code] || code;
    countries.push({
      code,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      currency,
    });
  }

  return countries.sort((a, b) => a.name.localeCompare(b.name));
}
