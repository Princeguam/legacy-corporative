import { Buffer } from "node:buffer";

/**
 * Standalone backend member email template.
 * Returns { to, subject, html, text, attachments }; spread into your mail sender.
 * Body is plain text (paragraphs or newline-separated text); all input is escaped.
 * Tables, inline styles, PNG CID attachments, Outlook conditional wrappers, and
 * safe system-font fallbacks target Gmail, Outlook, Apple Mail and other clients.
 * Only the backend sends mail.
 */

type EmailBody = string | readonly string[];

export type MemberEmailInput = {
    subject: string;
    recipientName: string;
    body: EmailBody;
    title: string;
    to: string;
};

type EmailImageSources = { logo?: string; watermark?: string };

export type EmailTemplateOptions = {
    /** Optional hosted HTTPS artwork; defaults are included as inline PNG attachments. */
    images?: EmailImageSources;
    /** Show a visible sample banner when preparing illustrative previews. */
    illustrative?: boolean;
};

type RenderedEmail = {
    to: string;
    subject: string;
    html: string;
    text: string;
    attachments: InlineImage[];
};

type InlineImage = {
    filename: string;
    content: Buffer;
    cid: string;
    contentType: "image/png";
    contentDisposition: "inline";
};

export function createMemberEmail(
    input: MemberEmailInput,
    options: EmailTemplateOptions = {},
): RenderedEmail {
    const to = recipientAddress(input.to);
    const subject = headerText(input.subject, "subject");
    const title = headerText(input.title, "title");
    const name = headerText(input.recipientName, "recipientName");
    const paragraphs = bodyParagraphs(input.body);
    const greeting = `Dear ${name},`;
    const content = [greeting, ...paragraphs].map(paragraph).join("\n");
    return checkedEmail({
        attachments: inlineImages(options),
        to,
        subject,
        html: renderLayout(
            subject,
            title,
            to,
            content,
            EMAIL_COPY.correspondence,
            options,
        ),
        text: [
            options.illustrative ? EMAIL_COPY.preview : "",
            BRAND_NAME,
            title,
            greeting,
            ...paragraphs,
            EMAIL_COPY.signoff,
            BRAND_NAME,
            EMAIL_COPY.tagline,
            `Sent to ${to}.`,
            EMAIL_COPY.support,
        ]
            .filter(Boolean)
            .join("\n\n"),
    });
}

// All styling, validation and artwork stay in this one portable file.
// Palette/type values match the approved Legacy Wealth design guide.

const BRAND_NAME = "Legacy Wealth Cooperatives";

const BRAND_WORDMARK = ["LEGACY", "WEALTH", "COOPERATIVES"] as const;

const INLINE_IMAGES = {
    logo: {
        filename: "legacy-tree.png",
        cid: "legacy-wealth-tree@templates.legacy-wealth.invalid",
        contentType: "image/png",
    },
    watermark: {
        filename: "tree-watermark.png",
        cid: "legacy-wealth-watermark@templates.legacy-wealth.invalid",
        contentType: "image/png",
    },
} as const;

const DEFAULT_IMAGES = {
    logo: `cid:${INLINE_IMAGES.logo.cid}`,
    watermark: `cid:${INLINE_IMAGES.watermark.cid}`,
} as const;

const EMAIL_COPY = {
    correspondence: "Member correspondence",
    signoff: "Warm regards,",
    tagline: "Rooted in trust. Growing together.",
    support:
        "For questions, contact your cooperative administrator through your usual support channel.",
    preview: "Illustrative preview — sample recipient and payment details.",
} as const;

const COLOURS = {
    "background-canvas": "#F3FDFD",
    "surface-default": "#FFFFFF",
    "surface-raised": "#F3FDFD",
    "text-primary": "#001414",
    "border-subtle": "#C9DEDD",
    "border-control": "#648683",
    "action-default": "#005250",
    "status-info-background": "#EAF2FF",
} as const;
const TYPE = {
    caption: { size: 12, line: 16, weight: 400 },
    label: { size: 14, line: 20, weight: 500 },
    body: { size: 16, line: 24, weight: 400 },
    lead: { size: 18, line: 28, weight: 400 },
    title: { size: 20, line: 28, weight: 500 },
    heading: { size: 24, line: 32, weight: 500 },
    section: { size: 32, line: 40, weight: 300 },
    display: { size: 40, line: 48, weight: 300 },
    hero: { size: 48, line: 56, weight: 300 },
} as const;
const SPACE = { small: 8, medium: 16, large: 24, section: 32 } as const;
const EMAIL_WIDTH = 600;
const EMAIL_RADIUS = 12;
const LOGO_SIZE = { width: 48, height: 56 } as const;
const WATERMARK_SIZE = { width: EMAIL_WIDTH, height: 96 } as const;
const MAX_EMAIL_HTML_BYTES = 90_000;

function escapeHtml(value: string): string {
    return value.replace(
        /[&<>"']/g,
        (character) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
            })[character]!,
    );
}

function requiredText(value: unknown, field: string): string {
    if (
        typeof value !== "string" ||
        !value.trim() ||
        Array.from(value).some((character) => {
            const code = character.charCodeAt(0);
            return (
                (code < 32 && code !== 9 && code !== 10 && code !== 13) ||
                code === 127
            );
        })
    ) {
        throw new TypeError(
            `${field} must be nonempty text without control characters.`,
        );
    }
    return value.trim();
}

function headerText(value: unknown, field: string): string {
    const text = requiredText(value, field);
    if (/[\r\n]/.test(text))
        throw new TypeError(`${field} must be a single line.`);
    return text;
}

function recipientAddress(value: unknown): string {
    const address = headerText(value, "to");
    if (
        address.length > 254 ||
        !/^[^\s<>(),;@]+@[^\s<>(),;@]+\.[^\s<>(),;@]+$/.test(address)
    ) {
        throw new TypeError("to must be one recipient email address.");
    }
    return address;
}

function bodyParagraphs(body: EmailBody): string[] {
    if (!Array.isArray(body) && typeof body !== "string")
        throw new TypeError(
            "body must be text or an array of text paragraphs.",
        );
    const paragraphs = (typeof body === "string" ? [body] : body).flatMap(
        (value) =>
            requiredText(value, "body")
                .replace(/\r\n?/g, "\n")
                .split(/\n\s*\n/),
    );
    if (!paragraphs.length)
        throw new TypeError("body must contain at least one paragraph.");
    return paragraphs;
}

function imageSource(value: unknown): string {
    const source = headerText(value, "image source");
    if (source === DEFAULT_IMAGES.logo || source === DEFAULT_IMAGES.watermark)
        return source;
    const url = new URL(source);
    if (url.protocol !== "https:" || url.username || url.password)
        throw new TypeError(
            "Images must use a CID or an absolute HTTPS URL without credentials.",
        );
    return url.href;
}

function checkedEmail(email: RenderedEmail): RenderedEmail {
    // Gmail clips large messages. Fail explicitly rather than drop receipt content.
    if (new TextEncoder().encode(email.html).length > MAX_EMAIL_HTML_BYTES)
        throw new RangeError(
            "The email HTML exceeds the supported size. Shorten the supplied text before sending.",
        );
    return email;
}

const uiFont = "'Inter', Arial, Helvetica, sans-serif";

const TEXT_STYLE = `font-family:${uiFont};font-size:${TYPE.body.size}px;line-height:${TYPE.body.line}px;font-weight:${TYPE.body.weight};color:${COLOURS["text-primary"]};`;

const LABEL_STYLE = `font-family:${uiFont};font-size:${TYPE.label.size}px;line-height:${TYPE.label.line}px;font-weight:${TYPE.label.weight};color:${COLOURS["text-primary"]};`;

function paragraph(text: string): string {
    return `<p style="margin:0 0 ${SPACE.large}px;${TEXT_STYLE}word-break:break-word;overflow-wrap:anywhere;">${escapeHtml(text).replace(/\n/g, "<br>")}</p>`;
}

function renderLayout(
    subject: string,
    title: string,
    to: string,
    content: string,
    eyebrow: string,
    options: EmailTemplateOptions = {},
): string {
    const logo = escapeHtml(
        imageSource(options.images?.logo ?? DEFAULT_IMAGES.logo),
    );
    const watermark = escapeHtml(
        imageSource(options.images?.watermark ?? DEFAULT_IMAGES.watermark),
    );
    const preview = options.illustrative
        ? `<tr><td bgcolor="${COLOURS["status-info-background"]}" style="padding:${SPACE.medium}px ${SPACE.section}px;${LABEL_STYLE}">${escapeHtml(EMAIL_COPY.preview)}</td></tr>`
        : "";
    return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><meta name="format-detection" content="telephone=no,date=no,address=no,email=no"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<title>${escapeHtml(subject)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><style>table,td,p,h1 {font-family:Arial,Helvetica,sans-serif !important;} .email-money {font-family:'Courier New',Courier,monospace !important;}</style><![endif]-->
<style>
:root{color-scheme:light;supported-color-schemes:light;}body{margin:0;padding:0;}table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}img{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;}a[x-apple-data-detectors]{color:inherit !important;text-decoration:none !important;}
@media screen and (max-width:599px){.outer-pad{padding:16px !important;}.content-pad{padding-left:16px !important;padding-right:16px !important;}.email-card{width:100% !important;}.email-money{font-size:${TYPE.heading.size}px !important;line-height:${TYPE.heading.line}px !important;}}
@media print{body,.email-canvas{background:${COLOURS["surface-default"]} !important;}.outer-pad{padding:0 !important;}.email-card{border:0 !important;}}
</style>
</head>
<body style="margin:0;padding:0;width:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:${COLOURS["background-canvas"]};${TEXT_STYLE}">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;" aria-hidden="true">${escapeHtml(title)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLOURS["background-canvas"]}" class="email-canvas" style="width:100%;background-color:${COLOURS["background-canvas"]};"><tr><td align="center" class="outer-pad" style="padding:${SPACE.section}px ${SPACE.medium}px;">
<!--[if mso]><table role="presentation" width="${EMAIL_WIDTH}" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLOURS["surface-default"]}" class="email-card" style="width:100%;max-width:${EMAIL_WIDTH}px;background-color:${COLOURS["surface-default"]};border:1px solid ${COLOURS["border-subtle"]};border-radius:${EMAIL_RADIUS}px;">
<tr><td height="8" bgcolor="${COLOURS["action-default"]}" style="height:8px;font-size:0;line-height:0;background-color:${COLOURS["action-default"]};">&nbsp;</td></tr>
${preview}
<tr><td class="content-pad" style="padding:${SPACE.section}px ${SPACE.section}px ${SPACE.large}px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="${LOGO_SIZE.width}" valign="middle" style="width:${LOGO_SIZE.width}px;padding-right:${SPACE.medium}px;"><img src="${logo}" width="${LOGO_SIZE.width}" height="${LOGO_SIZE.height}" alt="" style="display:block;width:${LOGO_SIZE.width}px;height:${LOGO_SIZE.height}px;"></td>
<td valign="middle" style="border-left:1px solid ${COLOURS["border-control"]};padding-left:${SPACE.medium}px;${LABEL_STYLE}font-weight:300;letter-spacing:${TYPE.label.size * 0.17}px;">${BRAND_WORDMARK.map(escapeHtml).join("<br>")}</td>
</tr></table></td></tr>
<tr><td class="content-pad" style="padding:0 ${SPACE.section}px;">
<p style="margin:0 0 ${SPACE.small}px;${LABEL_STYLE}">${escapeHtml(eyebrow)}</p>
<h1 style="margin:0 0 ${SPACE.section}px;font-family:${uiFont};font-size:${TYPE.heading.size}px;line-height:${TYPE.heading.line}px;font-weight:${TYPE.heading.weight};color:${COLOURS["text-primary"]};word-break:break-word;overflow-wrap:anywhere;">${escapeHtml(title)}</h1>
${content}
<p style="margin:${SPACE.section}px 0 ${SPACE.large}px;${TEXT_STYLE}">${escapeHtml(EMAIL_COPY.signoff)}<br>${escapeHtml(BRAND_NAME)}</p>
</td></tr>
<tr><td><img src="${watermark}" width="${WATERMARK_SIZE.width}" height="${WATERMARK_SIZE.height}" alt="" role="presentation" style="display:block;width:100%;max-width:${WATERMARK_SIZE.width}px;height:auto;"></td></tr>
<tr><td class="content-pad" bgcolor="${COLOURS["surface-raised"]}" style="padding:${SPACE.large}px ${SPACE.section}px;${TEXT_STYLE}background-color:${COLOURS["surface-raised"]};">
<p style="margin:0 0 ${SPACE.small}px;${LABEL_STYLE}">${escapeHtml(EMAIL_COPY.tagline)}</p>
<p style="margin:0 0 ${SPACE.small}px;${TEXT_STYLE}word-break:break-word;overflow-wrap:anywhere;">Sent to ${escapeHtml(to)}.</p>
<p style="margin:0;${TEXT_STYLE}">${escapeHtml(EMAIL_COPY.support)}</p>
</td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table>
</body></html>`;
}

// PNGs are MIME attachments, never base64 data URLs in the HTML. They preserve
// the original tree and the repeating watermark treatment from resources/temp.png.
const LOGO_PNG =
    "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";
const WATERMARK_PNG =
    "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";
function inlineImages(options: EmailTemplateOptions): InlineImage[] {
    const result: InlineImage[] = [];
    if ((options.images?.logo ?? DEFAULT_IMAGES.logo) === DEFAULT_IMAGES.logo)
        result.push({
            ...INLINE_IMAGES.logo,
            content: Buffer.from(LOGO_PNG, "base64"),
            contentDisposition: "inline",
        });
    if (
        (options.images?.watermark ?? DEFAULT_IMAGES.watermark) ===
        DEFAULT_IMAGES.watermark
    )
        result.push({
            ...INLINE_IMAGES.watermark,
            content: Buffer.from(WATERMARK_PNG, "base64"),
            contentDisposition: "inline",
        });
    return result;
}
