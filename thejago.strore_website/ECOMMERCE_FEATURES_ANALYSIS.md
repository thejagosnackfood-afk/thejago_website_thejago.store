# E-Commerce Frontend Audit - The Jago Store

Scope: `thejago.strore_website/frontend` (with backend route checks only to validate frontend contracts).

## 1. Feature Inventory

| Domain | Current State | Evidence |
| --- | --- | --- |
| Auth and account | Register/login modal, token-based auth, WhatsApp OTP verification, logout UI | `frontend/src/components/AuthModal.jsx`, `frontend/src/state/store.jsx:141`, `frontend/src/lib/api.js:3` |
| Catalog and discovery | Category rail/tiles, search with 250ms debounce, recommended/discount/flash/most-viewed sections | `frontend/src/components/SearchBar.jsx:10`, `frontend/src/components/CategoryRail.jsx:5`, `frontend/src/state/store.jsx:195` |
| Product cards | Pricing logic (discount + flash sale), lazy image loading, view tracking endpoint call | `frontend/src/components/ProductCard.jsx:6`, `frontend/src/components/ProductCard.jsx:31`, `frontend/src/components/ProductCard.jsx:21` |
| Cart | Guest cart in localStorage, server cart for authenticated user, add-only interaction | `frontend/src/state/store.jsx:110`, `frontend/src/state/store.jsx:223`, `frontend/src/state/store.jsx:237` |
| Checkout | One-click checkout from cart dock -> create order -> get Midtrans snap token -> open snap popup | `frontend/src/components/CartDock.jsx:17`, `frontend/src/components/CartDock.jsx:21`, `frontend/src/components/CartDock.jsx:66` |
| Payment | Midtrans Snap integration (sandbox/prod toggle) | `frontend/src/components/CartDock.jsx:88`, `frontend/.env.example:2` |
| UX state handling | Some loading states for reviews, basic empty state for product grid, limited checkout feedback | `frontend/src/components/Reviews.jsx:87`, `frontend/src/components/ProductGrid.jsx:17`, `frontend/src/components/CartDock.jsx:32` |

## 2. Code Quality Findings

### CQ-01: Guest cart is not merged after login
Severity: high  
Evidence: `frontend/src/state/store.jsx:138`, `frontend/src/state/store.jsx:220`, `frontend/src/components/AuthModal.jsx:31`  
Impact: Guest users can add products, authenticate, then see a different server cart; this increases cart abandonment at login.  
Fix: Add a `mergeGuestCartToServer()` flow after successful auth (loop guest items -> `POST /api/cart/items`), then clear `guestCart`.

### CQ-02: Checkout flow has no post-payment reconciliation
Severity: high  
Evidence: `frontend/src/components/CartDock.jsx:26`, `frontend/src/components/CartDock.jsx:74`, `website/src/routes/orderRoutes.js:41`  
Impact: Success/pending/failed outcomes are not reflected in UI, so users do not know if payment/order is complete.  
Fix: Store `orderId` in checkout state, poll `GET /api/orders/:orderId`, show explicit success/pending/failed confirmation screen, and refresh cart after status change.

### CQ-03: Cart UX supports add only (no quantity edit/remove in storefront)
Severity: medium  
Evidence: `frontend/src/components/ProductCard.jsx:44`, `frontend/src/components/CartDock.jsx:41`, `website/src/routes/cartRoutes.js:77`  
Impact: Users cannot recover from mistakes quickly, increasing friction before checkout.  
Fix: Add mini cart drawer/list with increment/decrement/remove controls, connected to `PUT /api/cart/items/:productId` and `DELETE /api/cart/items/:productId`.

### CQ-04: Search requests can race and overwrite newer results
Severity: medium  
Evidence: `frontend/src/state/store.jsx:167`, `frontend/src/components/SearchBar.jsx:10`  
Impact: Rapid typing may briefly show stale results; trust in search quality drops.  
Fix: Add `AbortController` cancellation inside the products effect and ignore outdated responses.

### CQ-05: Logout is local-only and does not terminate server session
Severity: medium  
Evidence: `frontend/src/state/store.jsx:256`, `website/src/routes/authRoutes.js:118`  
Impact: Server session remains active until TTL; shared-device risk and inconsistent auth semantics.  
Fix: Call `POST /api/auth/logout` before clearing token locally (best effort with fallback if network fails).

## 3. Security Findings

### SEC-01: Session token stored in localStorage
Severity: high  
Evidence: `frontend/src/lib/api.js:4`, `frontend/src/lib/api.js:8`  
Impact: Any XSS can exfiltrate bearer tokens and hijack sessions.  
Fix: Move auth to secure, httpOnly, sameSite cookies and keep frontend tokenless.

### SEC-02: Missing strong client-side input validation for auth/OTP
Severity: medium  
Evidence: `frontend/src/components/AuthModal.jsx:92`, `frontend/src/components/AuthModal.jsx:97`, `frontend/src/components/AuthModal.jsx:125`  
Impact: Weak input quality increases auth errors and brute-force surface (even if server validates).  
Fix: Enforce phone regex (`+` + digits), password min length/complexity, OTP numeric + fixed length, and inline validation messages.

### SEC-03: 401 handling does not clear stale credentials
Severity: medium  
Evidence: `frontend/src/lib/api.js:21`, `frontend/src/state/store.jsx:144`  
Impact: Expired/invalid sessions can leave app in broken retry loops and confusing auth state.  
Fix: In `apiFetch`, on `401` clear token and emit a global auth-expired event that resets user/cart state.

### SEC-04: Development OTP can leak in UI if misconfigured
Severity: low  
Evidence: `frontend/src/components/AuthModal.jsx:46`, `frontend/src/components/AuthModal.jsx:116`  
Impact: If mock OTP mode is enabled outside development, verification secrets are exposed to end users.  
Fix: Render `mockCode` only in explicit dev mode (`import.meta.env.DEV`) and hide in production builds.

## 4. Performance Findings

### PERF-01: Catalog fetches are not cached or deduplicated
Severity: medium  
Evidence: `frontend/src/state/store.jsx:167`, `frontend/src/state/store.jsx:195`  
Impact: Repeated category/search switching causes unnecessary network load and slower perceived response.  
Fix: Add keyed in-memory cache (`category+q+tag`) with short TTL and stale-while-revalidate behavior.

### PERF-02: Flash sale timer updates every second regardless of data
Severity: low  
Evidence: `frontend/src/components/FlashSaleBox.jsx:17`  
Impact: Constant re-renders even when no active countdown.  
Fix: Start interval only when `endAt` exists and stop when countdown reaches zero.

### PERF-03: Product card grid rerenders broadly on global store updates
Severity: medium  
Evidence: `frontend/src/state/store.jsx:262`, `frontend/src/components/ProductGrid.jsx:15`, `frontend/src/components/ProductCard.jsx:12`  
Impact: Cart/auth state changes can trigger avoidable rerenders in large product lists.  
Fix: Split store context by domain (catalog/cart/auth) or use selector-based state; memoize `ProductCard` with stable handlers.

### PERF-04: No route-level code splitting for non-critical widgets
Severity: low  
Evidence: `frontend/src/App.jsx:9`, `frontend/src/App.jsx:88`, `frontend/src/App.jsx:95`; build output `assets/index-fra-madO.js 171.11 kB`  
Impact: First load includes chat/reviews/UI extras even before shopper intent is known.  
Fix: Lazy-load `ChatWidget`, `Reviews`, and heavy secondary sections after initial interaction/viewport entry.

## 5. UX Findings

### UX-01: OTP step is forced after every login/register
Severity: high  
Evidence: `frontend/src/components/AuthModal.jsx:33`, `frontend/src/components/AuthModal.jsx:113`  
Impact: Returning verified users face unnecessary friction; checkout conversion drops if WhatsApp delivery is delayed.  
Fix: If `data.user.whatsappVerified` is true, close modal immediately after auth and skip OTP step.

### UX-02: Auto-opening auth modal at 2 cart items is disruptive
Severity: medium  
Evidence: `frontend/src/state/store.jsx:232`  
Impact: Interrupts browsing intent and can feel coercive before checkout intent exists.  
Fix: Trigger auth gate on checkout click, not while browsing; optionally use a non-blocking prompt banner.

### UX-03: Checkout errors rely on blocking alert dialog
Severity: medium  
Evidence: `frontend/src/components/CartDock.jsx:32`  
Impact: Poor mobile experience and no persistent recovery guidance.  
Fix: Replace `alert` with inline error callout and actionable CTAs (`Retry`, `Verify WhatsApp`, `Back to cart`).

### UX-04: Claims in hero/features do not match live payment stack
Severity: medium  
Evidence: `frontend/src/components/Hero.jsx:17`, `frontend/src/components/Features.jsx:20`, `frontend/src/components/CartDock.jsx:22`  
Impact: Trust risk when users see PayPal/Stripe claims but only Midtrans is operational.  
Fix: Update copy to the real payment methods, or ship the claimed providers before advertising them.

### UX-05: Product card is keyboard-focusable but lacks key handlers
Severity: low  
Evidence: `frontend/src/components/ProductCard.jsx:29`  
Impact: Accessibility gap for keyboard users (Enter/Space does not activate card behavior).  
Fix: Add `onKeyDown` handler for Enter/Space and ensure focus-visible styles are present.

## 6. Prioritized Roadmap

### P0 (highest impact, 1-2 sprints)
1. Auth: skip OTP for already verified users and add robust validation in `AuthModal`.
2. Cart: merge guest cart into server cart immediately after auth success.
3. Checkout: implement payment outcome states (success/pending/failed), order status polling, and cart refresh/clear logic.
4. Security baseline: move away from localStorage token storage and wire frontend logout to `POST /api/auth/logout`.
5. UX reliability: replace checkout alerts with inline, recoverable error states.

### P1 (conversion and discovery, next 2 sprints)
1. Catalog: add URL-synced search/category state and sortable/filterable product listing.
2. Cart UX: add mini cart panel with quantity edit/remove and stock-aware validation.
3. Search reliability: add request cancellation + cache to remove stale results and reduce API load.
4. Messaging alignment: update hero/feature claims to match actual payment/auth behavior.

### P2 (scaling and polish)
1. Performance: split non-critical widgets with lazy loading and intersection-triggered hydration.
2. State architecture: separate auth/catalog/cart context slices to reduce rerender pressure.
3. Accessibility: keyboard support and ARIA pass for interactive cards/buttons.
4. Observability: instrument funnel events (`add_to_cart`, `begin_checkout`, `payment_pending`, `payment_success`, `payment_failed`) to track drop-off.
