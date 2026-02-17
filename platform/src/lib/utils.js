import { format, formatDistanceToNow, isAfter } from 'date-fns'

/**
 * Formats a mission deadline for high-fidelity UI display.
 * Returns: "2 Days Left", "EXPIRED", or "No Deadline"
 */
export function formatMissionDeadline(deadline) {
  if (!deadline) return "No Deadline"
  
  const date = new Date(deadline)
  if (isNaN(date.getTime())) return "Invalid Date"
  
  const now = new Date()
  
  if (!isAfter(date, now)) {
    return "EXPIRED"
  }
  
  return formatDistanceToNow(date, { addSuffix: true }).replace('about ', '')
}

/**
 * Generates a Trust Badge configuration based on score
 */
export function getTrustStatus(score) {
  if (score >= 90) return { label: 'VERIFIED', color: '#00ffaa', bg: 'rgba(0, 255, 170, 0.1)' }
  if (score >= 70) return { label: 'RELIABLE', color: '#ffaa00', bg: 'rgba(255, 170, 0, 0.1)' }
  if (score >= 40) return { label: 'UNVERIFIED', color: '#888', bg: 'rgba(136, 136, 136, 0.1)' }
  return { label: 'HIGH RISK', color: '#ff3300', bg: 'rgba(255, 51, 0, 0.1)' }
}

/**
 * Prevents text from being too scanty in the UI
 */
export function truncate(str, len = 100) {
  if (!str) return ""
  return str.length > len ? str.substring(0, len) + "..." : str
}
