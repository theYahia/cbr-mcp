#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getDailyRatesSchema, handleGetDailyRates, getCurrencyRateSchema, handleGetCurrencyRate } from "./tools/rates.js";
import { getPreciousMetalsSchema, handleGetPreciousMetals } from "./tools/metals.js";
import { convertCurrencySchema, handleConvertCurrency } from "./tools/convert.js";
import { handleGetKeyRate } from "./tools/keyrate.js";

const server = new McpServer({
  name: "cbr-mcp",
  version: "1.0.0",
});

server.tool(
  "get_daily_rates",
  "Все курсы валют ЦБ РФ на указанную дату. Без авторизации.",
  getDailyRatesSchema.shape,
  async (params) => ({
    content: [{ type: "text", text: await handleGetDailyRates(params) }],
  }),
);

server.tool(
  "get_currency_rate",
  "Курс конкретной валюты к рублю с изменением за день.",
  getCurrencyRateSchema.shape,
  async (params) => ({
    content: [{ type: "text", text: await handleGetCurrencyRate(params) }],
  }),
);

server.tool(
  "get_key_rate",
  "Текущая ключевая ставка ЦБ РФ.",
  {},
  async () => ({
    content: [{ type: "text", text: await handleGetKeyRate() }],
  }),
);

server.tool(
  "get_precious_metals",
  "Учётные цены ЦБ РФ на золото, серебро, платину, палладий (руб./грамм).",
  getPreciousMetalsSchema.shape,
  async (params) => ({
    content: [{ type: "text", text: await handleGetPreciousMetals(params) }],
  }),
);

server.tool(
  "convert_currency",
  "Конвертация суммы из одной валюты в другую через курс ЦБ РФ.",
  convertCurrencySchema.shape,
  async (params) => ({
    content: [{ type: "text", text: await handleConvertCurrency(params) }],
  }),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[cbr-mcp] Сервер запущен. 5 инструментов. Авторизация не требуется.");
}

main().catch((error) => {
  console.error("[cbr-mcp] Ошибка запуска:", error);
  process.exit(1);
});
