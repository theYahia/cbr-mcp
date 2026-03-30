import type { CbrDailyResponse } from "./types.js";

const BASE_URL = "https://www.cbr-xml-daily.ru";
const TIMEOUT = 10_000;
const MAX_RETRIES = 3;

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (response.ok) return response;

      if (response.status >= 500 && attempt < retries) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        console.error(`[cbr-mcp] ${response.status} от ${url}, повтор через ${delay}мс (${attempt}/${retries})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      clearTimeout(timer);
      if (attempt === retries) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        console.error(`[cbr-mcp] Таймаут ${url}, повтор (${attempt}/${retries})`);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Все попытки исчерпаны");
}

export async function getDailyRates(date?: string): Promise<CbrDailyResponse> {
  let url: string;
  if (date) {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    url = `${BASE_URL}/archive/${yyyy}/${mm}/${dd}/daily_json.js`;
  } else {
    url = `${BASE_URL}/daily_json.js`;
  }

  const response = await fetchWithRetry(url);
  return response.json() as Promise<CbrDailyResponse>;
}

export async function getKeyRate(): Promise<{ rate: number; date: string }> {
  const response = await fetchWithRetry("https://www.cbr-xml-daily.ru/daily_json.js");
  const text = await response.text();
  const data = JSON.parse(text);

  // Key rate is not in the daily JSON directly.
  // Use cbr.ru XML endpoint for key rate.
  const keyRateResponse = await fetchWithRetry("https://www.cbr.ru/scripts/XML_KeyRate.asp");
  const xml = await keyRateResponse.text();

  // Parse last record from XML
  const records = xml.match(/<Record\s+Date="([^"]+)"\s+Id="[^"]*">\s*<Rate>([^<]+)<\/Rate>\s*<\/Record>/g);
  if (!records || records.length === 0) {
    throw new Error("Не удалось получить ключевую ставку ЦБ РФ");
  }

  const last = records[records.length - 1];
  const dateMatch = last.match(/Date="([^"]+)"/);
  const rateMatch = last.match(/<Rate>([^<]+)<\/Rate>/);

  if (!dateMatch || !rateMatch) {
    throw new Error("Не удалось распарсить ключевую ставку");
  }

  return {
    rate: parseFloat(rateMatch[1].replace(",", ".")),
    date: dateMatch[1],
  };
}

export async function getPreciousMetals(date?: string): Promise<Record<string, { price: number; date: string }>> {
  // CBR precious metals XML endpoint
  const now = new Date();
  const d1 = date ? new Date(date) : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const d2 = date ? new Date(date) : now;

  const fmt = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  const url = `https://www.cbr.ru/scripts/xml_metall.asp?date_req1=${fmt(d1)}&date_req2=${fmt(d2)}`;

  const response = await fetchWithRetry(url);
  const xml = await response.text();

  const metals: Record<string, string> = {
    "1": "Золото",
    "2": "Серебро",
    "3": "Платина",
    "4": "Палладий",
  };

  const result: Record<string, { price: number; date: string }> = {};
  const records = xml.match(/<Record\s+Date="([^"]+)"\s+Code="(\d+)">\s*<Buy>([^<]*)<\/Buy>\s*<Sell>([^<]*)<\/Sell>/g);

  if (records) {
    for (const record of records) {
      const m = record.match(/Date="([^"]+)"\s+Code="(\d+)">\s*<Buy>([^<]*)<\/Buy>\s*<Sell>([^<]*)<\/Sell>/);
      if (m) {
        const [, recordDate, code, buy] = m;
        const name = metals[code] || `Metal_${code}`;
        result[name] = {
          price: parseFloat(buy.replace(",", ".")),
          date: recordDate,
        };
      }
    }
  }

  return result;
}
