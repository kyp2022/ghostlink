# GhostLink Whitepaper

Version: 0.1  
Last updated: 2026-02-03  

## Abstract

Data increasingly behaves like an asset, but most users do not truly own it. It lives inside platform silos, and portability often requires exposing far more than what an application actually needs.

GhostLink turns real-world signals into verifiable on-chain credentials, with privacy as the default. Instead of revealing raw data, users prove conclusions. Applications can trust the result without collecting sensitive details.

## The Problem

- Fragmented identity: the same person leaves traces across many platforms, but apps cannot consume them consistently
- High trust cost: teams rely on screenshots, manual review, or centralized allowlists
- Privacy tradeoff: users must overshare in order to prove eligibility
- Sybil attacks: incentives are easily polluted by farmed accounts

## Core Principles

- Prove conclusions, not details
- Minimize disclosure by default: hash sensitive fields, avoid unnecessary persistence
- Portability and composability: once minted, credentials can be reused across apps and smart contracts

## Supported Signals and Credential Types

The current build supports four signal families, unified into a non-transferable on-chain credential:

- Developer identity signals (account existence, basic activity profile)
- Social identity signals (account existence and public metrics)
- Statement-based asset signals (upload a statement file, extract an asset conclusion, hash sensitive fields)
- Wallet signals (on-chain asset and activity summaries)

## End-to-End Flow

1. User connects a wallet and selects a signal source (authorization or upload)
2. Backend validates input and extracts the minimum required fields
3. Proof service produces verifiable proof material plus a one-time-use identifier
4. Smart contract verifies the proof and mints a non-transferable credential
5. Applications read the credential on-chain for access control, anti-sybil gating, and reputation

## Architecture

### Frontend

- Dual themes: dark and light layouts
- Language toggle: consistent UX across languages
- Progress modal: visualizes proof → transaction → confirmation
- Explorer: search by address or token id, inspect mint events and distributions

### Backend

- OAuth callback handling for supported providers
- File upload verification and extraction for statement-based flows
- Standardized proof request format and response normalization

### Proof Service

This repository includes a local mock prover for demo and integration testing. The prover is a swappable module: the UX remains the same when replaced by a production prover.

### Smart Contract and On-chain Data

- Non-transferable credentials prevent “buyable identity”
- A one-time-use identifier prevents replay and repeated minting
- Mint events provide an auditable trail for explorers and third-party consumers

## Privacy and Security Notes

- Minimal field collection: only what is needed for verification
- Sensitive field hashing: e.g. ID numbers are hashed server-side and only shown masked in UI
- Replay protection via one-time-use identifiers
- Input constraints: statement files must satisfy baseline signature existence checks to raise forgery cost

## Use Cases

- Lending access: prove an asset threshold without exposing balances
- Airdrop filtering: gate with real-world signals to reduce sybil pollution
- Membership and tickets: credentials as portable passes
- Growth and risk: reusable trust primitives that apps can compose

## Deployment

This repository supports two deployment styles:

- Frontend: build static assets and upload to a server directory served by a process
- Backend: build a jar, containerize, deploy, and run health checks

## Roadmap

- Q1 2026: core flows and minimal credentials
- Q2 2026: developer tooling, components, and documentation (completed)
- Q3 2026: richer economic layers and incentive design

## Disclaimer

The current build targets demos and integration testing and may use test networks and a mock proof service. Before production, additional hardening is required for input verification, certificate chain validation, risk controls, and audits.

