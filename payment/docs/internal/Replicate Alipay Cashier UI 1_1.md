I will update the `MockAlipayPage.tsx` file to match the provided Alipay Cashier image 1:1.

**Implementation Steps:**

1.  **Structure & Layout Updates**:
    -   Set container width to `max-w-[480px]` for precise sizing.
    -   Refine spacing (padding/margins) to match the screenshot.

2.  **Header Refinement**:
    -   Ensure background color is `#1677FF`.
    -   Align "支付宝收银台" and "安全支付" text.

3.  **Tab Switcher**:
    -   Implement the toggle style: Gray background container (`bg-gray-100`), White active tab (`bg-white`), Blue active text (`text-[#1677FF]`).

4.  **Typography & Content**:
    -   "支付金额" label: Centered, gray text.
    -   Amount: Large bold font for RMB, smaller gray font for USD.
    -   Central Box: Dashed border, centered icon, instruction text.

5.  **Footer & Legal**:
    -   Add the specific ICP license text: "ICP证：沪ICP备12345678号 | 支付宝版权所有".

**No new files will be created.** I will modify `apps/web/src/pages/MockAlipayPage.tsx`.