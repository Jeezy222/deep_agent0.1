# Implementation Plan: Full Payment Integration & Tenant Management

I will implement the complete payment lifecycle and tenant management system as requested.

## 1. Backend Updates (`支付/apps/server`)
- **Schema Update**: Add `callback_url` support to `CheckoutSessionRequest` to enable redirection back to the Chat app.
- **API Update**: Modify `/checkout/create-session` to include the callback URL in the generated payment link.
- **Tenant API**: Ensure `/debug/orgs` is available for the new Admin Dashboard.

## 2. Payment App Enhancements (`支付/apps/web`)
- **Payment Flow**: Update `CheckoutPage`, `MockAlipayPage`, and `SuccessPage` to preserve and use the `callback_url`.
- **Success Handling**: Implement auto-redirect back to `/chat` after successful payment.
- **New Admin Module**: Create a dedicated **Tenant Management Dashboard** (`/admin`) to view and manage organizations (fulfilling Requirement 4).

## 3. Frontend Integration (`deep agent0.1-main`)
- **Real Data Connection**: Modify `api/user/credits.ts` to fetch **real-time credit usage** from the Python backend instead of using mock data.
- **Pricing Logic**: Update `PricingModal.tsx` to initiate real payment sessions via the backend API.
- **Callback Handling**: Update `chat.tsx` to detect successful payments (`?payment_success=true`), trigger credit refresh, and show a success notification.

## 4. Verification & Logging
- **Data Init**: Initialize demo data to establish a valid Organization ID for testing.
- **End-to-End Test**: Verify the flow: Chat -> Pricing -> Payment App -> Success -> Chat (Credits Updated).
