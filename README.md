# TEKSUM Frontend

TEKSUM is a Nigerian digital services and VTU platform that provides customers with access to services such as airtime, data, cable TV subscriptions, electricity payments, examination pins, and other digital products.

This repository contains the **TEKSUM web frontend**.

The frontend communicates with the TEKSUM backend through the backend's API contracts. The backend, database, payment integrations, wallet ledger, VTU providers, and other server-side infrastructure are maintained separately.

---

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Supported Services](#supported-services)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Application Structure](#application-structure)
- [Service Purchase Flow](#service-purchase-flow)
- [Wallet and Funding](#wallet-and-funding)
- [Withdrawal](#withdrawal)
- [DVA Funding](#dva-funding)
- [Authentication](#authentication)
- [Security and Sensitive Data](#security-and-sensitive-data)
- [Transaction History](#transaction-history)
- [Legal Pages](#legal-pages)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Production Build](#production-build)
- [Deployment](#deployment)
- [Git and Repository Hygiene](#git-and-repository-hygiene)
- [Frontend/Backend Contract](#frontendbackend-contract)
- [Static Assets](#static-assets)
- [Development Rules](#development-rules)
- [Important Engineering Notes](#important-engineering-notes)
- [Project Status](#project-status)
- [Future Work](#future-work)

---

# Overview

TEKSUM is designed as a customer-facing digital services platform.

The frontend provides:

- Authentication and account access
- Customer dashboard
- Wallet management
- Wallet funding
- DVA funding
- Airtime purchases
- Data purchases
- Cable TV subscriptions
- Electricity payments
- Education/examination PIN purchases
- Airtime PIN purchases
- International airtime entry point
- Transaction history
- Purchase review and confirmation
- Account/settings functionality
- Legal and policy pages

The frontend is responsible for the user interface, client-side state, navigation, validation, presentation, and communication with the backend API.

The backend remains the authority for:

- Wallet balances
- Financial calculations
- Fees
- Transaction creation
- Payment processing
- Service fulfillment
- Provider communication
- Transaction states
- Authentication/session validation
- DVA account creation
- Withdrawal eligibility
- Financial ledger operations
- Sensitive server-side data handling

The frontend must never attempt to replace backend financial or transaction logic.

---

# Core Features

## Customer Dashboard

The dashboard provides customers with an overview of their TEKSUM account and access to available digital services.

The dashboard includes access to:

- Wallet
- Service purchases
- Transaction history
- Account/settings
- Other customer-facing functionality

---

## Wallet

The wallet is the customer's primary balance used for TEKSUM service purchases.

Wallet functionality includes:

- Viewing wallet balance
- Funding wallet
- Viewing wallet-related activity
- Initiating withdrawals
- DVA funding where available
- Viewing applicable wallet information and terms

Financial amounts displayed by the frontend must always come from backend responses.

The frontend must not invent, estimate, or independently calculate authoritative wallet balances.

---

# Supported Services

The current TEKSUM service categories include:

| Category | Description |
|---|---|
| Airtime | VTU airtime purchase |
| Data | Mobile data purchase |
| Cable TV | Cable subscription payments |
| Electricity | Electricity bill/token payments |
| Education PIN | Examination/education PIN products |
| Airtime PIN | Airtime PIN products |
| International Airtime | Reserved/coming-soon service |

---

## Airtime

The Airtime flow allows customers to purchase VTU airtime.

Typical information includes:

- Network/provider
- Beneficiary phone number
- Amount

Before the transaction is confirmed, the customer is shown a purchase review.

The beneficiary phone number is masked on the review screen.

The actual value remains available to the application and is sent to the backend when the customer confirms the purchase.

---

## Data

The Data flow allows customers to purchase mobile data bundles.

Typical information includes:

- Network/provider
- Beneficiary phone number
- Data bundle

A review screen is displayed before confirmation.

Sensitive beneficiary identifiers are masked on the review screen.

---

## Cable TV

Cable TV purchases support the available cable providers.

Typical information includes:

- Provider
- Smart-card/customer identifier
- Package
- Amount

The customer is shown a review screen before confirmation.

The smart-card identifier is masked on the review screen.

Provider navigation follows the provider-specific route structure.

---

## Electricity

Electricity purchases support electricity bill/token payments.

Typical information includes:

- Electricity provider
- Meter number
- Customer information where applicable
- Amount

The meter number is masked on the purchase review screen.

---

## Education PINs

Education PIN purchases support examination-related products and providers.

Current provider categories include:

- WAEC
- NECO
- NABTEB
- JAMB

Education provider pages use provider-specific routes.

For example, selecting another provider from a provider-specific product page navigates to that provider's corresponding page rather than treating the provider as a simple form selector.

Some education products may require information such as:

- Profile code
- Email
- Other provider-specific identifiers

Sensitive identifiers are masked on the review screen.

Education PIN products that do not require a sensitive customer identifier do not artificially introduce masking.

---

## Airtime PIN

Airtime PIN products are supported as a separate service category.

Because the purchase does not necessarily require a customer-supplied sensitive identifier in the same way as VTU airtime, the frontend does not invent unnecessary masking fields.

Digital fulfillment values such as PINs must remain readable when they are delivered to the customer.

---

## International Airtime

International airtime is represented in the frontend as an available/coming-soon service where the backend integration is not yet exposed as an active customer purchase flow.

The frontend must not pretend that an unavailable service is operational.

---

# Technology Stack

The frontend is built around the following technologies:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui-style component architecture
- Next.js App Router
- Client/server React components as appropriate
- REST API communication with the TEKSUM backend

Package versions should be taken from the repository's:

- `package.json`
- `package-lock.json`

These files are the authoritative dependency definitions.

---

# Project Architecture

The frontend follows a feature-oriented Next.js application structure.

A simplified representation is:

```text
TEKSUM Frontend
│
├── app/
│   ├── authentication
│   ├── dashboard
│   ├── wallet
│   ├── services
│   ├── transactions
│   ├── settings
│   ├── terms
│   ├── privacy
│   └── wallet-terms
│
├── components/
│   └── reusable UI and service components
│
├── lib/
│   ├── API/client utilities
│   └── shared frontend utilities
│
├── public/
│   └── images/
│       ├── services/
│       └── providers/
│
└── configuration files
The exact directory structure should always be confirmed against the current repository rather than assumed from this documentation.

Application Structure
src/app

Contains Next.js application routes and pages.

This is where customer-facing routes such as dashboard pages, wallet pages, service pages, settings, and legal pages are implemented.

src/components

Contains reusable UI and application components.

One important shared component is the service purchase form.

The service form supports multiple service categories while allowing category-specific behavior.

This shared architecture is important because purchase review behavior, validation, provider selection, and confirmation should remain consistent across services.

src/lib

Contains shared frontend utilities and API-related functionality.

The API client is responsible for communicating with the TEKSUM backend.

The frontend should use these existing abstractions rather than creating duplicate API clients for individual pages.

public/images

Static service and provider assets are stored here.

Current asset organization:

public/
└── images/
    ├── services/
    │   ├── airtime.webp
    │   ├── cable.webp
    │   ├── electricity.webp
    │   ├── international-airtime.webp
    │   ├── data.webp
    │   ├── education.webp
    │   └── airtime-pin.webp
    │
    └── providers/
        ├── mtn.png
        ├── airtel.png
        ├── glo.png
        ├── 9mobile.png
        ├── waec.png
        ├── neco.png
        ├── nabteb.png
        ├── jamb.png
        ├── dstv.png
        ├── gotv.png
        ├── startimes.png
        └── showmax.png

Only assets actually present in the repository should be referenced by production UI.

Service Purchase Flow

The standard TEKSUM purchase flow is:

Customer selects service
        │
        ▼
Customer enters required information
        │
        ▼
Frontend validates input
        │
        ▼
Purchase Review
        │
        ▼
Sensitive identifiers are masked
        │
        ▼
Customer confirms
        │
        ▼
Frontend sends actual values to backend
        │
        ▼
Backend validates and processes transaction
        │
        ▼
Backend returns transaction result
        │
        ▼
Frontend displays result
        │
        ▼
Transaction appears in post-transaction views

The review screen is an important part of the customer experience.

A customer should be able to verify what they are about to purchase before confirming the transaction.

Purchase Review and Sensitive Information

TEKSUM follows a deliberate rule for customer-supplied identifiers.

Sensitive identifiers are masked in purchase review screens.

Examples include:

Phone numbers
Smart-card numbers
Meter numbers
Profile codes
Email addresses where applicable

For example:

Actual:
08031234567

Review:
0803••••••67

The masking is purely a presentation concern.

The frontend must not replace the actual value with the masked value when sending the transaction to the backend.

Conceptually:

Customer input
     │
     ├── actual value → application state → backend
     │
     └── masked value → review UI

Financial amounts are different.

Amounts must never be masked merely for consistency.

For example:

Amount: ₦5,000

should remain:

₦5,000

not:

₦••••
Post-Transaction Data

Transaction history and other post-transaction customer views should not expose sensitive provider/customer metadata unnecessarily.

The frontend should rely on the backend's transaction response contract and should not attempt to reconstruct sensitive transaction metadata from local purchase state.

Where the backend does not return sensitive metadata to the customer, the frontend must not invent or persist a replacement representation of it.

Digital Fulfillment Values

Some services return digital fulfillment values.

Examples include:

Airtime PIN
Education PIN
Serial number
Electricity token

These are purchased digital products or fulfillment values.

They should not be masked simply because they are strings or numbers.

For example:

PIN: 123456789012

must remain usable by the customer.

Masking rules apply to sensitive customer/provider identifiers, not to the digital product the customer has purchased.

Wallet and Funding

Wallet funding is handled through the TEKSUM backend.

The frontend is responsible for:

Displaying the funding interface.
Collecting the required information.
Sending the request to the backend.
Displaying the backend response.
Handling pending/success/failed states.
Refreshing wallet information where necessary.

The frontend must not independently credit the wallet.

A successful wallet balance change must originate from the backend.

DVA Funding

TEKSUM supports DVA-based wallet funding.

The DVA flow includes customer consent.

The frontend must obtain the customer's consent before requesting DVA account information where the backend contract requires current consent.

The consent flow communicates with the backend consent endpoint.

Conceptually:

Customer opens DVA funding
        │
        ▼
DVA consent displayed
        │
        ▼
Customer agrees
        │
        ▼
Frontend records consent with backend
        │
        ▼
Backend confirms consent
        │
        ▼
Frontend requests DVA account
        │
        ▼
DVA details displayed

The backend remains authoritative for DVA account status and eligibility.

Withdrawal

Withdrawal is a backend-controlled financial operation.

The frontend must not assume a fixed withdrawal fee.

Withdrawal fees and eligibility can depend on the backend's current contract, including applicable cost-recovery components.

The backend may return information such as:

Withdrawal amount
Fee
Payout amount
Wallet balance
Wallet balance after withdrawal
Minimum withdrawal
Maximum withdrawal
Daily withdrawal limit
Daily amount used
Daily remaining amount
Fee percentage
Minimum fee
Fee model
Funding cost recovery
Provider transfer fee
Stamp duty
Provider cost recovery
Currency
Withdrawal eligibility
Reasons for rejection

The backend response is authoritative.

The frontend should display backend-provided financial values rather than hard-coding assumptions.

Authentication

Authentication is handled through the TEKSUM backend/API.

The frontend provides the customer-facing authentication experience, including:

Registration
Login
Session-aware dashboard access
Logout
Account/settings access

Sensitive credentials and authentication secrets must never be committed to Git.

Environment variables containing secrets must remain local or be stored in the deployment platform's secure environment configuration.

Security and Sensitive Data

Security is a core consideration of the TEKSUM frontend.

Never commit secrets

Files such as:

.env
.env.local
.env.*.local

must not be committed.

The repository's .gitignore is configured to prevent this.

Do not expose sensitive identifiers unnecessarily

Sensitive customer identifiers should only be displayed when necessary.

Where a review UI requires the customer to verify an identifier, it should use the masked representation.

Do not mask financial amounts

Masking is for sensitive identifiers.

It is not a replacement for financial values.

Do not trust client-side financial calculations

The frontend may display calculations supplied by the backend.

It must not become the source of truth for:

Wallet balances
Transaction totals
Fees
Payout amounts
Eligibility
Daily limits
Transaction status
Provider success/failure

The backend remains authoritative.

Transaction History

Transaction history is a post-transaction view.

The frontend should present the transaction information returned by the backend without exposing data that the customer should not receive.

Transaction states may include states such as:

Pending
Successful
Failed
Reversed

The frontend should not assume that a transaction is successful simply because a request was submitted.

The backend transaction state is authoritative.

Legal Pages

The frontend contains customer-facing legal pages including:

Terms
Privacy Policy
Wallet & Funding Terms

The legal pages cover areas including:

Account usage
Wallets
Funding
DVA funding
Withdrawals
Fees
Transactions
Refunds
PIN/security responsibilities
Fraud
Availability
Suspension
Disputes
Privacy and data processing
Nigerian governing law

The legal pages are product documentation as well as customer-facing contractual/policy content.

Final legal and regulatory review should be performed by the appropriate Nigerian legal/compliance professionals before production launch.

Environment Variables

Environment-specific configuration belongs in environment files and deployment settings rather than source code.

Local development commonly uses:

.env.local

An example configuration is provided through:

.env.example

Do not copy production secrets into the Git repository.

Before deployment, make sure every environment variable required by the current application is configured in the deployment environment.

The repository should contain the variable names/examples necessary for developers to understand the configuration without exposing secret values.

Local Development
Requirements

Install the appropriate versions of:

Node.js
npm

The exact dependency versions are defined by:

package.json
package-lock.json
Install dependencies

From the project root:

npm install
Configure environment variables

Create a local environment file:

cp .env.example .env.local

Then populate the required values for the local development environment.

Never commit .env.local.

Start development server
npm run dev

The application should then be available through the local Next.js development server.

Production Build

Before deploying, verify that the application builds successfully:

npm run build

A successful production build is an important validation step before deployment.

To run the production build locally:

npm run start
Deployment

TEKSUM's frontend can be deployed to a Next.js-compatible hosting platform such as Vercel.

Vercel deployment model

The repository does not need to contain:

node_modules/
.next/

These are generated artifacts.

Vercel installs the project's dependencies using:

package.json
package-lock.json

and performs the production build during deployment.

Environment variables should be configured through the deployment platform.

Production architecture

A simplified production architecture is:

                    ┌─────────────────┐
                    │     Customer    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ TEKSUM Frontend │
                    │     Next.js     │
                    └────────┬────────┘
                             │
                             │ HTTPS / API
                             ▼
                    ┌─────────────────┐
                    │  TEKSUM Backend │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
          Database        Payments      VTU Providers

The frontend is not the financial authority.

The backend controls the actual financial and service operations.

Git and Repository Hygiene

The repository should only contain source and project files required to build and maintain TEKSUM.

The following should not be committed:

node_modules/
.next/
.env
.env.local
.env.*.local
coverage/
dist/
build/
logs/
*.log

Generated archives such as ZIP files should also normally remain outside the Git repository unless there is a deliberate reason to version them.

Initial Git setup

A new clone/repository can be initialized with:

git init
git branch -M main

Review the files:

git status

Stage them:

git add .

Commit:

git commit -m "Initial TEKSUM frontend"
Typical development workflow
git status
git add .
git commit -m "Describe the change"
git push

Keep commits focused.

Avoid mixing unrelated frontend changes into the same commit.

Frontend/Backend Contract

The TEKSUM frontend depends on the backend API contract.

The backend ZIP/repository is the authoritative source for API behavior.

When implementing or modifying a frontend integration:

Inspect the current frontend implementation.
Inspect the current backend contract.
Identify the exact endpoint/request/response expected.
Change only the frontend where appropriate.
Preserve existing frontend architecture.
Test the affected flow.
Avoid inventing backend fields or behavior.

The frontend must never modify the backend merely to make a frontend implementation easier.

Important financial rule

For financial operations:

Frontend = presentation + request
Backend  = authority

This applies especially to:

Wallet balances
Funding
Withdrawals
Fees
Payouts
Transaction status
Refunds
Daily limits
Provider fulfillment
Static Assets

Service images belong in:

public/images/services/

Provider logos belong in:

public/images/providers/

Provider assets currently include networks and examination/cable providers.

When adding a new provider:

Add the appropriate provider asset.
Update the relevant provider configuration/data.
Update the affected UI only.
Verify the provider route.
Verify the purchase flow.
Verify the review screen.

Do not replace unrelated assets or redesign the global UI simply to add one provider.

Development Rules

TEKSUM frontend development follows a conservative modification strategy.

1. Preserve working functionality

Do not rebuild working features unnecessarily.

Prefer:

existing implementation
        +
targeted correction

over:

delete existing implementation
        +
rebuild entire feature
2. Make narrowly scoped changes

Each frontend task should have a clearly defined target.

For example:

Fix education provider navigation

should not become:

rewrite service-form.tsx
redesign dashboard
change global styling
rewrite provider architecture

unless those changes are actually required.

3. Do not modify the backend for frontend tasks

Backend changes are outside the scope of this repository's frontend work unless explicitly required as a separate backend task.

The backend is inspected to understand the contract, not modified to accommodate an incorrect frontend assumption.

4. Do not modify global UI unnecessarily

Global files such as:

src/app/globals.css

should not be changed during narrowly scoped feature work unless the task specifically concerns global styling.

Avoid introducing unrelated:

theme changes
typography changes
sidebar changes
layout changes
global component changes
5. Preserve the existing architecture

If an existing shared component already handles a feature, extend it carefully rather than creating competing implementations.

For example, service purchase behavior is shared across several service categories.

6. Validate before delivery

A frontend modification should be checked for:

TypeScript correctness
Build compatibility
Route correctness
Existing behavior preservation
Duplicate patching
Accidental global changes
Accidental backend changes

Where a scripted patch is used, it should preferably:

Detect the expected existing code.
Apply only the intended modification.
Refuse to patch if the expected baseline is no longer present.
Be safe to run more than once.
Avoid overwriting newer developer changes.
Important Engineering Notes
Customer input versus display value

A critical frontend distinction is:

submitted value

versus:

display value

Sensitive identifiers can have a masked display representation without changing the submitted value.

Example:

State:
phone = "08031234567"

Review:
phone = "0803••••••67"

API request:
phone = "08031234567"

Never send the masked presentation value to the backend.

Financial values

Financial values should remain accurate and visible.

Do not:

mask amounts
round amounts for presentation if precision matters
invent fees
hard-code backend financial rules
calculate authoritative balances locally

Use the backend response.

Provider navigation

Provider-specific service pages should behave consistently.

For example:

/dashboard/exam-pins/waec/verification-pin

can navigate to another provider's corresponding route rather than leaving the customer trapped on the WAEC page.

The same general principle applies to provider-specific service navigation elsewhere in the application.

Project Status

The TEKSUM frontend currently contains the major customer-facing foundation required for the platform.

Implemented areas include:

Authentication interface
Customer dashboard
Wallet interface
Wallet funding
DVA consent flow
Service purchase flows
Purchase review screens
Sensitive identifier masking
Transaction history
Provider navigation
Legal pages
Static service/provider assets
Settings/account interface
Backend API integration

The backend has separately been tested for real-money wallet funding and VTU airtime fulfillment.

The frontend should therefore be treated as a production-oriented application rather than a prototype.

Current Development Priorities

When continuing development, prioritize:

Maintaining frontend/backend contract alignment.
Completing and verifying customer-facing service flows.
Testing purchase review and confirmation behavior.
Verifying provider navigation.
Ensuring sensitive identifiers are handled correctly.
Maintaining accurate wallet/financial presentation.
Improving UX without destabilizing working functionality.
Production deployment readiness.
Future Work

Potential future work includes:

Additional VTU service providers
International airtime activation
Additional education products
Improved transaction detail views
Additional wallet functionality
Enhanced customer notifications
Production UX refinements
Accessibility improvements
More comprehensive automated frontend testing
Error-state and edge-case improvements
Performance optimization
Further production hardening

Future work should continue to follow the targeted-change principle.

Contributing

Before modifying the frontend:

Understand the existing implementation.
Confirm the backend API contract when an API is involved.
Identify the smallest correct change.
Implement the change without unnecessary restructuring.
Test the affected flow.
Check for unrelated file modifications.
Commit a focused change.

Avoid large refactors unless there is a clear architectural reason.

Repository Philosophy

TEKSUM is built around a simple principle:

Keep the customer experience simple while keeping financial and transactional authority on the backend.

The frontend should make the platform:

Clear
Fast
Trustworthy
Easy to use
Consistent
Secure in presentation
Accurate in financial information

The backend remains the source of truth for transactions and financial operations.

License

This project is proprietary software.

Unless explicitly authorized by the project owner, the source code, branding, designs, business logic, assets, and associated intellectual property must not be copied, redistributed, modified for external use, or commercially reused.

TEKSUM

TEKSUM — Digital services made simple.


### One important thing

I would put this into the repository as:

```text
README.md

at the root of teksum-frontend, alongside:

package.json
package-lock.json
src/
public/
next.config.ts
tsconfig.json
.gitignore