 # 📋 Stamps & Coins - Development Task List

> **Gerelateerd:** [Blueprint](file:///c:/Users/peanu/.gemini/antigravity/scratch/Stamps%20&%20Coins/STAMPS_COINS_BLUEPRINT.md) | [Implementation Plan](file:///C:/Users/peanu/.gemini/antigravity/brain/d7d3a14c-e92b-4333-9a4c-cb627b638045/implementation_plan.md)

---

## 🏁 Sprint 0: Project Setup & Infrastructure (Week 1)

### Supabase Setup
- [x] **SUP-001** Supabase project aanmaken
- [x] **SUP-002** Database schema uitvoeren (alle tabellen)
- [x] **SUP-003** RLS policies configureren voor `profiles`
- [x] **SUP-004** RLS policies configureren voor `vaults`
- [x] **SUP-005** RLS policies configureren voor `items`
- [x] **SUP-006** RLS policies configureren voor `portfolio_history`
- [x] **SUP-007** Supabase Auth configureren (email/password + anon)
- [x] **SUP-008** Storage bucket aanmaken voor images

### React Native Project
- [x] **RN-001** Expo project initialiseren met TypeScript template
- [x] **RN-002** Supabase client library installeren + configureren
- [x] **RN-003** Navigation structure opzetten (React Navigation)
- [x] **RN-004** Basis folder structuur aanmaken (`src/screens`, `src/services`, etc.)
- [x] **RN-005** Environment variabelen setup (`.env`)
- [x] **RN-006** ESLint + Prettier configureren
- [x] **RN-007** Husky pre-commit hooks installeren

### Externe Services
- [x] **EXT-001** Cloudinary account aanmaken
- [x] **EXT-002** Cloudinary upload preset configureren (unsigned)
- [x] **EXT-003** RevenueCat account aanmaken
- [x] **EXT-004** RevenueCat iOS/Android apps registreren
- [x] **EXT-005** RevenueCat product configureren (pro_vault_monthly €7,99)
- [x] **EXT-006** Gemini API key genereren
- [x] **EXT-007** Sentry project aanmaken

### CI/CD
- [x] **CI-001** GitHub repository aanmaken
- [x] **CI-002** GitHub Actions workflow schrijven
- [x] **CI-003** EAS configureren voor builds
- [x] **CI-004** Branch protection rules instellen

---

## 🔐 Sprint 1: Authentication & User Management (Week 2)

### Auth Implementation
- [x] **AUTH-001** `authService.ts` implementeren (Supabase basis)
- [x] **AUTH-002** Anonymous login (Ghost mode) flow opzetten
- [x] **AUTH-003** Ghost-to-Email account linking implementeren
- [x] **AUTH-004** `useAuth` hook maken voor globale state
- [x] **AUTH-005** Profiel bewerken (username, full name)
- [x] **AUTH-006** Password reset flow afmaken

### Onboarding & Auth UI
- [x] **UI-001** Onboarding discovery screens (3 slides)
- [x] **UI-002** Login & Registratie schermen bouwen
- [x] **UI-003** "Claim Account" UI voor ghost users in Profile
- [x] **UI-004** Form validatie met Zod implementeren
- [x] **UI-005** Loading states & Error handling UI toevoegen
- [ ] **UI-006** Lottie animaties in Onboarding integreren

### Onboarding
- [x] **ONB-001** `OnboardingScreen.tsx` - Screen 1 (Dashboard preview)
- [x] **ONB-002** `OnboardingScreen.tsx` - Screen 2 (Vaults preview)
- [x] **ONB-003** `OnboardingScreen.tsx` - Screen 3 (Item Detail preview)
- [x] **ONB-004** `OnboardingScreen.tsx` - Screen 4 (Market preview)
- [x] **ONB-005** `OnboardingScreen.tsx` - Screen 5 (Privacy & CTA)
- [x] **ONB-007** `CoachMark.tsx` component - Glassmorphism tekstballonnen
- [x] **ONB-008** `OnboardingScreen.tsx` - Progress indicator (dots)

### Profile
- [x] **PROF-001** `ProfileScreen.tsx` - Pro status indicator
- [x] **PROF-002** `ProfileScreen.tsx` - Valuta selector (EUR/USD)
- [x] **PROF-003** `ProfileScreen.tsx` - Export buttons (Placeholders)
- [x] **PROF-004** `ProfileScreen.tsx` - Logout functie
- [x] **PROF-005** `profileService.ts` - CRUD operaties
- [x] **PROF-006** `profileService.ts` - Item count tracking
- [x] **PROF-007** `profileService.ts` - Region detection (Auto-detect)

---

## 📸 Sprint 2: Core Scanner & AI Integration (Week 4-5)

### Camera & Image Processing
- [x] **SCAN-001** `ScannerScreen.tsx` - Camera view setup
- [x] **SCAN-002** `ScannerScreen.tsx` - Capture button (FAB)
- [x] **SCAN-003** `ScannerScreen.tsx` - Thumbnail laatste scan
- [x] **SCAN-004** `AROverlay.tsx` - Randdetectie visualisatie
- [x] **SCAN-005** `AROverlay.tsx` - Bounding box preview
- [x] **SCAN-006** `AROverlay.tsx` - Item count indicator (bulk)
- [x] **SCAN-007** Real-time feedback UI ("Houd stil...", "Meer licht...")

### Image Service
- [x] **IMG-001** `imageService.ts` - captureImage()
- [x] **IMG-002** `imageService.ts` - compressImage() (max 1080px)
- [x] **IMG-003** `imageService.ts` - stripExifData() (GPS removal)
- [x] **IMG-004** `imageService.ts` - uploadToCloudinary()
- [x] **IMG-005** Server-side EXIF check in Edge Function

### Edge Functions
- [x] **EF-001** `process-scan/index.ts` - Receive Cloudinary URL
- [x] **EF-002** `process-scan/index.ts` - Send to Gemini 3 Flash
- [x] **EF-003** `process-scan/index.ts` - Parse JSON response
- [x] **EF-004** `process-scan/index.ts` - Check/create global_asset
- [x] **EF-005** `process-scan/index.ts` - Save to items table
- [x] **EF-006** `process-scan/index.ts` - Rate limiting (35/hour)
- [x] **EF-007** `get-market-price/index.ts` - Cache check (7 dagen)
- [x] **EF-008** `get-market-price/index.ts` - Google Search Grounding
- [x] **EF-009** `get-market-price/index.ts` - Update market_prices
- [x] **EF-010** `get-market-price/index.ts` - Continent-based prompts

### AI Service
- [x] **AI-001** `aiService.ts` - identifyItem()
- [x] **AI-002** `aiService.ts` - getMarketPrice()
- [x] **AI-003** `aiService.ts` - batchIdentify() (bounding boxes)
- [x] **AI-004** `ai.types.ts` - TypeScript interfaces voor AI responses

### Processing UI
- [x] **PROC-001** `ProcessingDock.tsx` - Floating progress bar
- [x] **PROC-002** `ProcessingDock.tsx` - Thumbnail preview
- [x] **PROC-003** `ProcessingDock.tsx` - Items counter
- [x] **PROC-004** `SkeletonCard.tsx` - Placeholder voor items
- [x] **PROC-005** `SkeletonCard.tsx` - Shimmer animatie

### Error Handling
- [x] **ERR-001** "Foto onduidelijk" toast
- [x] **ERR-002** "Offline, lokaal opgeslagen" toast
- [x] **ERR-003** "Item niet herkend" toast
- [x] **ERR-004** "Kluis vol" paywall trigger
- [x] **ERR-005** Confidence < 80% gele indicator

### Testing & Verification
- [x] **TEST-001** `imageService.test.ts` - Unit tests for processing
- [x] **TEST-002** `cloudinaryService.test.ts` - Unit tests for upload (mocked)
- [x] **TEST-003** `aiService.test.ts` - Unit tests for AI flow (mocked)
- [x] **TEST-004** `App.test.tsx` (Sprint 0) - Smoke test
- [x] **TEST-005** `OnboardingScreen.test.tsx` (Sprint 1) - View states
- [x] **TEST-006** `LoginScreen.test.tsx` (Sprint 1) - Input handling
- [x] **TEST-007** `CoachMark.test.tsx` (Sprint 1) - Visibility logic
- [x] **TEST-008** `ProcessingDock.test.tsx` (Sprint 2) - Progress states
- [x] **TEST-009** `AROverlay.test.tsx` (Sprint 2) - Overlay markers
- [x] **TEST-010** Run `npm test` and verify all tests pass (28/28 passed)

---

## 🗄️ Sprint 3: Vault System & Item Management (Week 6-7)

### Vault Management
- [x] **VAULT-001** `VaultsScreen.tsx` - Lijst van alle vaults
- [x] **VAULT-002** `VaultsScreen.tsx` - "Nieuwe kluis" button
- [x] **VAULT-003** `VaultsScreen.tsx` - Vault waarde subtotalen
- [x] **VAULT-004** `VaultsScreen.tsx` - Swipe-to-delete
- [x] **VAULT-005** `VaultDetailScreen.tsx` - Grid/lijst toggle
- [x] **VAULT-006** `VaultDetailScreen.tsx` - Filter chips
- [x] **VAULT-007** `VaultDetailScreen.tsx` - Zoekbalk
- [x] **VAULT-008** `VaultDetailScreen.tsx` - Items grid/lijst
- [x] **VAULT-009** `vaultService.ts` - getVaults()
- [x] **VAULT-010** `vaultService.ts` - createVault()
- [x] **VAULT-011** `vaultService.ts` - updateVault()
- [x] **VAULT-012** `vaultService.ts` - deleteVault()
- [x] **VAULT-013** `vaultService.ts` - moveItem()

### Item Management
- [x] **ITEM-001** `ItemDetailScreen.tsx` - Hero image
- [x] **ITEM-002** `ItemDetailScreen.tsx` - Prijsgrafiek
- [x] **ITEM-003** `ItemDetailScreen.tsx` - Technische specificaties
- [x] **ITEM-004** `ItemDetailScreen.tsx` - Conditie rapport
- [x] **ITEM-005** `ItemDetailScreen.tsx` - Manual Override input
- [x] **ITEM-006** `ItemDetailScreen.tsx` - Vault selector
- [x] **ITEM-007** `ItemDetailScreen.tsx` - Delete button
- [x] **ITEM-008** `PriceChart.tsx` - Historische prijsdata
- [x] **ITEM-009** `PriceChart.tsx` - 7d/1m/1y toggles
- [x] **ITEM-010** `PriceChart.tsx` - "User Defined" markers
- [x] **ITEM-011** `ConditionBadge.tsx` - Grade weergave
- [x] **ITEM-012** `ConditionBadge.tsx` - Kleurcodering
- [x] **ITEM-013** `ConditionBadge.tsx` - Confidence indicator

### Item Service
- [x] **ITEM-014** `itemService.ts` - getItems()
- [x] **ITEM-015** `itemService.ts` - getItem()
- [x] **ITEM-016** `itemService.ts` - updateItem()
- [x] **ITEM-017** `itemService.ts` - deleteItem()
- [x] **ITEM-018** `itemService.ts` - setManualValue()
- [x] **ITEM-019** `itemService.ts` - ignoreMarketSuggestions()

### Manual Override
- [x] **MO-001** `PriceSuggestionModal.tsx` - Toast bij nieuwe marktprijs
- [x] **MO-002** `PriceSuggestionModal.tsx` - "Update" button
- [x] **MO-003** `PriceSuggestionModal.tsx` - "Negeren" button
- [x] **MO-004** `last_modified_at` check voor concurrency

---

## 📊 Sprint 4: Dashboard & Portfolio Tracking (Week 8-9)

### Dashboard Components
- [x] **DASH-001** `DashboardScreen.tsx` - Layout setup
- [x] **DASH-002** `DashboardScreen.tsx` - FAB camera button
- [x] **DASH-003** `DashboardScreen.tsx` - Nieuws carrousel
- [x] **DASH-004** `PortfolioValue.tsx` - Geanimeerde waarde
- [x] **DASH-005** `PortfolioValue.tsx` - Valuta formatting
- [x] **DASH-006** `PortfolioValue.tsx` - Loading skeleton
- [x] **DASH-007** `ChangeIndicator.tsx` - Percentage stijging/daling
- [x] **DASH-008** `ChangeIndicator.tsx` - Groene/rode kleur
- [x] **DASH-009** `ChangeIndicator.tsx` - Pijl icoon
- [x] **DASH-010** `TopMoversWidget.tsx` - Top 3 stijgende items
- [x] **DASH-011** `TopMoversWidget.tsx` - Horizontale scroll
- [x] **DASH-012** `TopMoversWidget.tsx` - Item thumbnails

### Realtime Updates
- [x] **RT-001** `useRealtimePrices.ts` - Supabase subscription setup
- [x] **RT-002** `useRealtimePrices.ts` - market_prices listener
- [x] **RT-003** `useRealtimePrices.ts` - UI refresh trigger
- [x] **RT-004** `useRealtimePrices.ts` - Lokale portfolio update

### Portfolio Service
- [x] **PORT-001** `portfolioService.ts` - getTotalValue()
- [x] **PORT-002** `portfolioService.ts` - get24hChange()
- [x] **PORT-003** `portfolioService.ts` - getHistory()
- [x] **PORT-004** `portfolioService.ts` - recordDailySnapshot()

### Edge Function
- [ ] **PORT-005** `daily-snapshot/index.ts` - Cronjob configuratie
- [ ] **PORT-006** `daily-snapshot/index.ts` - Portfolio berekening per user
- [ ] **PORT-007** `daily-snapshot/index.ts` - Insert in portfolio_history

---

## 📰 Sprint 5: Market Insights & News Feed (Week 10)

### News Feed UI
- [ ] **NEWS-001** `MarketScreen.tsx` - Nieuwsfeed lijst
- [ ] **NEWS-002** `MarketScreen.tsx` - Pull-to-refresh
- [ ] **NEWS-003** `MarketScreen.tsx` - Category filters
- [ ] **NEWS-004** `NewsCard.tsx` - Afbeelding (+ fallback)
- [ ] **NEWS-005** `NewsCard.tsx` - Titel
- [ ] **NEWS-006** `NewsCard.tsx` - Samenvatting
- [ ] **NEWS-007** `NewsCard.tsx` - Bron badge
- [ ] **NEWS-008** `PriceAlert.tsx` - Speciale kaart voor prijswijzigingen

### Edge Function
- [ ] **NEWS-009** `news_feed` tabel aanmaken in Supabase
- [ ] **NEWS-010** `generate-news-feed/index.ts` - RSS scraping
- [ ] **NEWS-011** `generate-news-feed/index.ts` - Gemini filtering/samenvatting
- [ ] **NEWS-012** `generate-news-feed/index.ts` - Opslaan in database
- [ ] **NEWS-013** Cronjob configuratie (elke 6 uur)

---

## 💎 Sprint 6: Monetization & Pro Features (Week 11-12)

### Paywall UI
- [x] **PAY-001** `PaywallScreen.tsx` - Feature vergelijking
- [x] **PAY-002** `PaywallScreen.tsx` - Prijs weergave (€7,99/maand)
- [x] **PAY-003** `PaywallScreen.tsx` - Purchase button
- [x] **PAY-004** `PaywallScreen.tsx` - Restore purchases link
- [ ] **PAY-005** `PaywallScreen.tsx` - Terms & Privacy links
- [ ] **PAY-006** `FeatureComparison.tsx` - Checklist Free vs Pro

### RevenueCat Integration
- [x] **RC-001** `subscriptionService.ts` - initialize()
- [x] **RC-002** `subscriptionService.ts` - getOfferings()
- [x] **RC-003** `subscriptionService.ts` - purchase()
- [x] **RC-004** `subscriptionService.ts` - restorePurchases()
- [x] **RC-005** `subscriptionService.ts` - checkProStatus()

### Webhook
- [ ] **RC-006** `handle-revenuecat-webhook/index.ts` - Signature validatie
- [ ] **RC-007** `handle-revenuecat-webhook/index.ts` - Event parsing
- [ ] **RC-008** `handle-revenuecat-webhook/index.ts` - pro_status update
- [ ] **RC-009** `handle-revenuecat-webhook/index.ts` - Event logging

### Pro Feature Gating
- [ ] **PRO-001** `useProStatus.ts` hook
- [ ] **PRO-002** `ScannerScreen.tsx` - Item count check
- [ ] **PRO-003** `ScannerScreen.tsx` - Paywall trigger bij > 35 items
- [ ] **PRO-004** `ProBadge.tsx` component

### Export Functionaliteit
- [ ] **EXP-001** `ExportScreen.tsx` - CSV export button
- [ ] **EXP-002** `ExportScreen.tsx` - PDF export button (Pro only)
- [ ] **EXP-003** `ExportScreen.tsx` - Export history
- [ ] **EXP-004** `generate-export/index.ts` - CSV generatie
- [ ] **EXP-005** `generate-export/index.ts` - PDF generatie

---

## ✨ Sprint 7: Polish, Testing & Launch Prep (Week 13-14)

### Unit Tests
- [ ] **TEST-001** `itemService.test.ts`
- [ ] **TEST-002** `authService.test.ts`
- [ ] **TEST-003** `portfolioService.test.ts`
- [ ] **TEST-004** `exifScrubber.test.ts`
- [ ] **TEST-005** 35-item limit test
- [ ] **TEST-006** Currency conversion test

### Integration Tests
- [ ] **TEST-007** `scanFlow.test.ts`
- [ ] **TEST-008** `purchaseFlow.test.ts`
- [ ] **TEST-009** `ghostToEmail.test.ts`

### E2E Tests
- [ ] **TEST-010** `happyPath.test.ts`
- [ ] **TEST-011** `paywallBlocking.test.ts`
- [ ] **TEST-012** `onboardingFlow.test.ts`

### Sentry Integration
- [x] **SENT-001** Sentry Initialization in App.tsx
- [ ] **SENT-002** `errorService.ts` - captureException()
- [ ] **SENT-003** `errorService.ts` - setUser()
- [ ] **SENT-004** `errorService.ts` - addBreadcrumb()
- [ ] **SENT-005** Breadcrumbs in alle services
- [ ] **SENT-006** Error categorization

### Performance
- [ ] **PERF-001** Image lazy loading in Vault grid
- [ ] **PERF-002** Virtualized lists voor grote collecties
- [ ] **PERF-003** Offline queue voor scans
- [ ] **PERF-004** Supabase query optimization

### App Store Prep
- [ ] **STORE-001** App icon (1024x1024)
- [ ] **STORE-002** Screenshots (iPhone 6.5")
- [ ] **STORE-003** Screenshots (iPhone 5.5")
- [ ] **STORE-004** Screenshots (Android)
- [ ] **STORE-005** Feature graphic (Android)
- [ ] **STORE-006** Promotional video
- [ ] **STORE-007** App beschrijving (NL)
- [ ] **STORE-008** App beschrijving (EN)
- [ ] **STORE-009** Keywords
- [ ] **STORE-010** Release notes
- [ ] **STORE-011** Privacy policy URL
- [ ] **STORE-012** Support URL

### Final Builds
- [ ] **BUILD-001** EAS production build iOS
- [ ] **BUILD-002** EAS production build Android
- [ ] **BUILD-003** TestFlight beta test
- [ ] **BUILD-004** Google Play internal test
- [ ] **BUILD-005** Final QA pass
- [ ] **BUILD-006** App Store submission
- [ ] **BUILD-007** Play Store submission

---

## � Backlog & Future Improvements

### Testing Infrastructure
- [ ] **TEST-EXT-001** Database Integration Tests (Real DB with seed/teardown)
- [ ] **TEST-EXT-002** E2E Testing with Detox or Maestro

---

## �📈 Statistieken

| Sprint | Taken | Status |
|--------|-------|--------|
| Sprint 0 | 27 | [x] 100% |
| Sprint 1 | 33 | [x] 100% |
| Sprint 2 | 47 | [x] 100% |
| Sprint 3 | 33 | [x] 100% |
| Sprint 4 | 19 | [x] 100% |
| Sprint 5 | 13 | [ ] 0% |
| Sprint 6 | 22 | [/] 41% |
| Sprint 7 | 35 | [/] 3% |
| **Totaal** | **229 taken** | **~67% voltooid** |

---

> **Note:** Task IDs kunnen gebruikt worden voor tracking in een project management tool (Jira, Linear, etc.)
