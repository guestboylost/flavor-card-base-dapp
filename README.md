# Flavor Card

**Field report:** this repo documents a deployed Base dApp used for flavor notes. The observed user path is short: arrive, connect wallet, saving a taste signal, inspect the flavor card.

## Evidence collected

| Field | Value |
| --- | --- |
| Base Developer Dashboard | Registered |
| Build ID / Base App ID | `6a07f5324c3f57496e83968c` |
| Builder Wallet | `0x0BD1352B0dDbf7580A42d1Bc62EA345648a10A09` |
| Builder Code | `bc_ja509vn6` |
| Live Demo | https://flavor-card.vercel.app |
| GitHub Repository | https://github.com/guestboylost/flavor-card-base-dapp |
| Network | Base |
| Deployment | Vercel |

## Notes from the field

The app avoids account-email identity assumptions. Public project identity is established by matching the Base App ID, builder wallet, Builder Code, Vercel deployment, and repository.

## Equipment

Next.js UI plus wagmi/viem for wallet and Base chain behavior

## Local reproduction

```bash
npm install
npm run dev
```

## Red lines

Do not commit `.env`, private keys, seed phrases, RPC keys, GitHub tokens, or Vercel tokens. Use `.env.example` only for placeholders.

License: MIT
