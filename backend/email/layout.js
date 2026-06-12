// backend/email/layout.js
// Single source of HTML for all emails.
// Templates pass structured data objects — this file owns all markup.

const BRAND_NAME    = "Hostel Finder";
const BRAND_TAGLINE = "Your trusted hostel marketplace";
const SUPPORT_EMAIL = process.env.EMAIL || "support@hostelfinder.com";

// ── Detail row ────────────────────────────────────────────────────────────────
const renderDetailRow = ({ label, value }) => `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;">
      <span style="display:inline-block;min-width:130px;font-size:13px;
                   color:#64748b;font-weight:500;">${label}</span>
      <span style="font-size:13px;color:#1e293b;font-weight:600;">
        ${value != null && value !== "" ? String(value) : "—"}
      </span>
    </td>
  </tr>`;

// ── Detail table ──────────────────────────────────────────────────────────────
const renderDetails = (details) => {
  if (!details?.length) return "";
  return `
  <table width="100%" cellpadding="0" cellspacing="0"
         style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;
                padding:0 16px;margin:20px 0;border-collapse:collapse;">
    ${details.map(renderDetailRow).join("")}
  </table>`;
};

// ── CTA button ────────────────────────────────────────────────────────────────
const renderCta = (cta) => {
  if (!cta?.text || !cta?.href) return "";
  return `
  <table cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
    <tr>
      <td>
        <a href="${cta.href}"
           style="display:inline-block;background:#2563eb;color:#ffffff;
                  text-decoration:none;padding:13px 26px;border-radius:8px;
                  font-size:14px;font-weight:600;letter-spacing:0.2px;
                  mso-padding-alt:13px 26px;">
          ${cta.text} &rarr;
        </a>
      </td>
    </tr>
  </table>`;
};

// ── Note line ─────────────────────────────────────────────────────────────────
const renderNote = (note) => {
  if (!note) return "";
  return `<p style="margin:16px 0 0;font-size:13px;color:#64748b;line-height:1.6;">${note}</p>`;
};

// ── Main layout ───────────────────────────────────────────────────────────────
export const renderEmail = ({ subject, preheader = "", greeting, heading, body, details, cta, note }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;
             font-family:'Segoe UI',Helvetica,Arial,sans-serif;
             -webkit-text-size-adjust:100%;">

  <!-- inbox preview text (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${preheader || heading}&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation"
             style="max-width:600px;width:100%;">

        <!-- Brand header -->
        <tr>
          <td style="background:#0f172a;padding:24px 36px;
                     border-radius:12px 12px 0 0;">
            <span style="font-size:20px;font-weight:700;color:#ffffff;
                         letter-spacing:-0.3px;">&#127968; ${BRAND_NAME}</span>
            <span style="display:block;font-size:12px;color:#94a3b8;margin-top:3px;">
              ${BRAND_TAGLINE}
            </span>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="background:#ffffff;padding:36px;
                     border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">

            <h2 style="margin:0 0 20px;font-size:21px;font-weight:700;
                       color:#0f172a;line-height:1.3;">
              ${heading}
            </h2>

            <p style="margin:0 0 12px;font-size:15px;color:#374151;line-height:1.7;">
              ${greeting},
            </p>

            <p style="margin:0;font-size:15px;color:#374151;line-height:1.7;">
              ${body}
            </p>

            ${renderDetails(details)}
            ${renderNote(note)}
            ${renderCta(cta)}

          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="background:#ffffff;padding:0 36px;
                     border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
            <hr style="border:none;border-top:1px solid #f1f5f9;margin:0;" />
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 36px;
                     border:1px solid #e2e8f0;border-top:none;
                     border-radius:0 0 12px 12px;">
            <p style="margin:0 0 4px;font-size:12px;color:#64748b;line-height:1.5;">
              Questions? Email us at
              <a href="mailto:${SUPPORT_EMAIL}"
                 style="color:#2563eb;text-decoration:none;">${SUPPORT_EMAIL}</a>
            </p>
            <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.5;">
              &copy; ${new Date().getFullYear()} ${BRAND_NAME}.
              You received this because an action occurred on your account.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
