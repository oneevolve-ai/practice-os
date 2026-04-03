interface RequestData {
  title: string;
  travelerName: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  estimatedCost: number;
}

function baseTemplate(title: string, body: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #18181b; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0; font-size: 16px;">Practice OS — Travel</h2>
      </div>
      <div style="border: 1px solid #e4e4e7; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
        <h3 style="margin: 0 0 16px 0; color: #18181b;">${title}</h3>
        ${body}
        <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
        <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
          This is an automated notification from Practice OS (OneEvolve.AI)
        </p>
      </div>
    </div>
  `;
}

function requestDetails(req: RequestData) {
  return `
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr><td style="padding: 4px 0; color: #71717a;">Traveler:</td><td style="padding: 4px 0;">${req.travelerName}</td></tr>
      <tr><td style="padding: 4px 0; color: #71717a;">Destination:</td><td style="padding: 4px 0;">${req.destination}</td></tr>
      <tr><td style="padding: 4px 0; color: #71717a;">Dates:</td><td style="padding: 4px 0;">${req.departureDate} — ${req.returnDate}</td></tr>
      <tr><td style="padding: 4px 0; color: #71717a;">Est. Cost:</td><td style="padding: 4px 0;">₹${req.estimatedCost.toLocaleString()}</td></tr>
    </table>
  `;
}

export function pendingApprovalEmail(req: RequestData) {
  return {
    subject: `[Approval Required] Travel: ${req.title}`,
    html: baseTemplate(
      `Travel Request Pending Approval`,
      `<p style="color: #3f3f46;">${req.travelerName} has submitted a travel request that needs your approval.</p>
       ${requestDetails(req)}`
    ),
  };
}

export function approvedEmail(req: RequestData, comment?: string) {
  return {
    subject: `[Approved] Travel: ${req.title}`,
    html: baseTemplate(
      `Travel Request Approved`,
      `<p style="color: #15803d; font-weight: 600;">Your travel request has been approved.</p>
       ${requestDetails(req)}
       ${comment ? `<p style="color: #3f3f46; margin-top: 12px;"><strong>Comment:</strong> ${comment}</p>` : ""}`
    ),
  };
}

export function rejectedEmail(req: RequestData, comment?: string) {
  return {
    subject: `[Rejected] Travel: ${req.title}`,
    html: baseTemplate(
      `Travel Request Rejected`,
      `<p style="color: #dc2626; font-weight: 600;">Your travel request has been rejected.</p>
       ${requestDetails(req)}
       ${comment ? `<p style="color: #3f3f46; margin-top: 12px;"><strong>Reason:</strong> ${comment}</p>` : ""}`
    ),
  };
}
