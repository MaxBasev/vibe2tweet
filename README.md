# Vibe2Tweet

A Telegram bot that turns your drafts into polished X (Twitter) posts using OpenAI — generates 3 variants, lets you pick one, then publishes to X (optionally cross-posting to a Telegram channel).


## Features

- **AI Translation + Style**: Translates between languages and applies persona tone, driven by your custom prompts.
- **Multi-Account / Multi-Persona**: Post to multiple X accounts with isolated configs and prompts.
- **Approval Workflow**:
  - Validation & length checks (280 chars).
  - 3 AI-generated variants to choose from.
  - One-click publishing via X API v2.
  - Optional cross-posting to Telegram channels.
- **Built for Reliability**:
  - Service-based modular architecture.
  - Centralized config & env validation.
  - Safe mode via allowlist / whitelisting.

## How it works

1. You send a draft to the Telegram bot (any language).
2. The bot asks which X account/persona to use.
3. Each persona has its own **custom prompt** (editable in `src/config/prompts.js` by default) that defines the translation/styling rules  
   (e.g., RU→EN professional tone, Hindi→Dutch casual tone — anything you want).
4. OpenAI generates **3 variants** based on that prompt.
5. You pick one variant (or cancel).
6. The bot publishes it to X and replies with the post link.
7. Optionally, it cross-posts a notification to a Telegram channel.

## Architecture

```
src/
├── bot/           # Telegram interaction logic & flow handlers
├── config/        # Environment validation & configuration
├── services/      # External integrations (OpenAI, X)
└── utils/         # Shared utilities (Logger, etc.)
```

## Quick Start

### Prerequisites
- Node.js v18+
- X Developer Account (API v2)
- OpenAI API Key
- Telegram Bot Token

### Get credentials
- **OpenAI API key**: https://platform.openai.com/api-keys  
- **Telegram bot token** (via @BotFather): https://core.telegram.org/bots#botfather  
- **X Developer account / App**: https://developer.x.com/  
- **X API docs (OAuth / v2)**: https://developer.x.com/en/docs/x-api
- **Your Telegram numeric user id** (for allowlist): @userinfobot

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/maxbasev/vibe2tweet.git
   cd vibe2tweet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configuration**
   ```bash
   cp .env.example .env
   ```
   Fill in your API credentials in `.env`.

4. **Run locally**
   ```bash
   npm run dev
   ```

## Tech Stack

* **Runtime**: Node.js
* **Server**: Express.js
* **AI**: OpenAI (GPT-4o)
* **Integrations**: `twitter-api-v2`, `node-telegram-bot-api`
* **Tooling**: ESLint, Prettier

## Deployment

### Vercel (Serverless)

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Set environment variables in the Vercel dashboard.

## Roadmap

- [ ] **History of Drafts**: Ability to view and reuse past generations.
- [ ] **Scheduling**: Schedule tweets for future publication directly from Telegram.
- [ ] **Image Support**: Attach and process images for tweets.

## Security Note

- **Never commit tokens**: Use `.env` for local development and environment variables in production.
- **Access Control**: Set `ALLOWED_USER_ID` (your Telegram numeric user id) to restrict usage.
  - *Tip: Find your numeric ID using @userinfobot.*

## License

MIT
