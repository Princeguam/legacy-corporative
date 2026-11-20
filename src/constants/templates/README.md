# Backend email templates

Copy `member-email.ts` and `receipt-email.ts` into your Node.js backend. Each file contains its own function, input types, HTML styles, validation and PNG artwork. Their only import is Node's built-in `Buffer`; they do not depend on the frontend or an email library.

Both functions return `{ to, subject, html, text, attachments }`. Pass that object to your existing mail sender, along with your configured `from` address. **Keep `attachments`**: the original tree logo and repeating watermark use inline PNG attachments referenced by `cid:` in the HTML. The PNG data is stored in the TypeScript files, so there are no separate asset files to deploy.

## General member email

```ts
import { createMemberEmail } from './member-email.js'

const message = createMemberEmail({
  subject: 'A cooperative update',
  title: 'Your next chapter',
  recipientName: 'Samira Yusuf',
  to: 'samira.yusuf@example.com',
  body: [
    'Thank you for being part of Legacy Wealth Cooperatives.',
    'Your next member update will be shared soon.',
  ],
}, { illustrative: true }) // Illustrative example; omit this option for real mail.

// In your backend, using an existing Nodemailer-compatible transporter:
// await transporter.sendMail({ from: configuredSender, ...message })
```

`body` accepts plain text or an array of text paragraphs. Blank lines separate paragraphs; single newlines become line breaks. All supplied text is HTML-escaped, so passing HTML displays that markup as text. `subject`, `title`, `recipientName` and `to` must be nonempty single-line strings; `to` accepts one email address.

## Confirmed contribution receipt

```ts
import { createReceiptEmail } from './receipt-email.js'

const message = createReceiptEmail({
  to: 'samira.yusuf@example.com',
  recipientName: 'Samira Yusuf',
  // Optional: subject, title and body. Defaults describe a confirmed contribution.
  transaction: {
    type: 'Contribution',
    status: 'Completed',
    receiptNumber: 'LWC-RCP-2026-0042',
    transactionId: 'TX-0042',
    memberId: 'LW-001',
    amountMinor: 8_000_001, // Illustrative: 80,000.01 NGN, recorded in kobo.
    paidOn: '2026-11-17',
    approvedAt: '2026-11-18T09:30:00+01:00',
    approvedBy: 'Cooperative administrator',
    paymentReference: 'BANK-20261117-0042',
    paymentMethod: 'Bank transfer', // Optional.
    description: 'November contribution', // Optional.
  },
}, { illustrative: true }) // Illustrative example; omit this option for real mail.

// After the backend has persisted and authorized administrator approval:
// await transporter.sendMail({ from: configuredSender, ...message })
```

Use the saved payment record and approval identity when calling the receipt function. The function rejects pending/non-contribution records, missing approval details, invalid dates, and nonpositive or imprecise amounts. These input guards do not perform server authorization, persist approval or prevent duplicate sending; those belong to the backend's approval workflow.

`amountMinor` is an exact integer number or `bigint` in NGN kobo. Unsafe JavaScript numbers are rejected. `paidOn` is a calendar date in `YYYY-MM-DD` form; `approvedAt` requires an explicit timezone. The receipt preserves the payment date and displays the confirmation timestamp in UTC. Money is formatted with `Intl.NumberFormat`, including a full currency name.

## Email rendering

The HTML uses presentation tables, inline styles, a fluid 600px layout, normal PNG images, Outlook conditional markup and system-font fallbacks. Both templates preserve the supplied tree and the watermark pattern from `resources/temp.png`. Inter falls back to Arial/Helvetica; IBM Plex Mono falls back to Courier. Essential content remains live text, with a plain-text alternative, when a client blocks images or styles.

If your sending service uses hosted images instead of inline attachments, supply public absolute HTTPS URLs in the optional second argument. Each image can be overridden independently:

```ts
const options = {
  images: {
    logo: 'https://your-domain.example/brand/legacy-tree.png',
    watermark: 'https://your-domain.example/brand/tree-watermark.png',
  },
}
// createMemberEmail(input, options) or createReceiptEmail(input, options)
```

Export the built-in PNG buffers from a generated message if you need the exact artwork for hosting. Overridden images are omitted from `attachments`. HTML data URLs, SVG and CSS background images are not used in sent messages. Messages over 90,000 HTML bytes throw a `RangeError` to leave headroom below Gmail's clipping threshold; shorten the supplied text before retrying.

The templates are designed for Gmail, Outlook and Apple Mail. Actual inbox rendering has not been verified; image blocking, automatic dark-mode recolouring, fonts and rounded corners vary by client. Test a message with your sender in those inboxes before production use.
