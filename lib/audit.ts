import transactions, { type Transaction } from "@/lib/data"

export type AuditLog = {
  id: string
  timestamp: string
  eventType: string
  deviceId: string
  module: string
  actionTaken: "Blocked" | "Flagged" | "Approved"
}

// Simple generator: derive one log entry per transaction
export function generateAuditLogs(from: Transaction[] = transactions): AuditLog[] {
  return from.map((t) => {
    let action: AuditLog["actionTaken"] = "Approved"
    if (t.status === "Blocked" || t.riskScore > 85) action = "Blocked"
    else if (t.riskScore >= 60) action = "Flagged"

    // determine event type and module heuristically
    let eventType = "Transaction Processed"
    let module = "Location"
    if (t.productName.toLowerCase().includes("camera") || t.productName.toLowerCase().includes("cam")) {
      eventType = "Image Forensics"
      module = "Image"
    } else if (t.riskScore > 80) {
      eventType = "Geofence Breach"
      module = "Location"
    } else if (t.status === "Verified") {
      eventType = "Successful Verification"
      module = "OTP"
    }

    return {
      id: t.id,
      timestamp: t.timestamp,
      eventType,
      deviceId: t.customerName || t.id,
      module,
      actionTaken: action,
    }
  })
}

export default generateAuditLogs()
