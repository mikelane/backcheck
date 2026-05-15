# Backcheck

Portland renters get background-checked, credit-checked, eviction-screened. The landlord behind the LLC? Nobody checks them. Backcheck flips that asymmetry: type a Portland address and the tool walks the ownership chain — Multnomah County Assessor, Oregon SOS business registry, registered agents — surfacing who actually owns the building and how many other properties they control through a web of LLCs.

## Run locally

```bash
npm install
npm run dev
# open http://localhost:8080
```

## Deploy

This app is deployed via [Steady](https://steady.dev). Push your branch and Steady handles everything — no Dockerfile, no config files needed. That's the point.
