# @theyahia/cbr-mcp

MCP-сервер для API Центрального Банка РФ — курсы валют, ключевая ставка, драгоценные металлы, конвертация. **Без авторизации**, работает из коробки.

[![npm](https://img.shields.io/npm/v/@theyahia/cbr-mcp)](https://www.npmjs.com/package/@theyahia/cbr-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Часть серии [Russian API MCP](https://github.com/theYahia/russian-mcp) (50 серверов) by [@theYahia](https://github.com/theYahia).

## Установка

### Claude Desktop

Добавьте в `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cbr": {
      "command": "npx",
      "args": ["-y", "@theyahia/cbr-mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add cbr -- npx -y @theyahia/cbr-mcp
```

### VS Code / Cursor

Добавьте в `.vscode/mcp.json`:

```json
{
  "servers": {
    "cbr": {
      "command": "npx",
      "args": ["-y", "@theyahia/cbr-mcp"]
    }
  }
}
```

### Windsurf

Добавьте в настройки MCP Toolkit:

```json
{
  "mcpServers": {
    "cbr": {
      "command": "npx",
      "args": ["-y", "@theyahia/cbr-mcp"]
    }
  }
}
```

> Авторизация **не нужна** — API ЦБ РФ полностью открытый.

## Инструменты (5)

| Инструмент | Описание |
|------------|----------|
| `get_daily_rates` | Все курсы валют ЦБ РФ на указанную дату |
| `get_currency_rate` | Курс конкретной валюты к рублю с изменением за день |
| `get_key_rate` | Текущая ключевая ставка ЦБ РФ |
| `get_precious_metals` | Учётные цены на золото, серебро, платину, палладий |
| `convert_currency` | Конвертация суммы из одной валюты в другую через курс ЦБ |

## Примеры запросов

```
Какой курс доллара сегодня?
```

```
Переведи 1000 USD в евро
```

```
Какая ключевая ставка ЦБ?
```

```
Какие цены на золото и серебро?
```

```
Покажи все курсы валют на 1 января 2025
```

## Часть серии Russian API MCP

| MCP | Статус | Описание |
|-----|--------|----------|
| [@metarebalance/dadata-mcp](https://github.com/theYahia/dadata-mcp) | ✅ готов | Адреса, компании, банки, телефоны |
| [@theyahia/cbr-mcp](https://github.com/theYahia/cbr-mcp) | ✅ готов | Курсы валют, ключевая ставка |
| @theyahia/yookassa-mcp | 📅 скоро | Платежи, возвраты, чеки 54-ФЗ |
| @theyahia/moysklad-mcp | 📅 скоро | Склад, заказы, контрагенты |
| ... | 📅 | **+46 серверов** — [полный список](https://github.com/theYahia/russian-mcp) |

## Лицензия

MIT
