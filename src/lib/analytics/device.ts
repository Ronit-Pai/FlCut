export type DeviceType = "Desktop" | "Mobile" | "Tablet" | "Unknown";
export function getDeviceType(userAgent: string | null | undefined): DeviceType {
  if (!userAgent) return "Unknown";

  if (/tablet|ipad|playbook|silk/i.test(userAgent)) return "Tablet";
  if (/mobile|android|iphone|ipod|blackberry|windows phone|iemobile/i.test(userAgent))
    return "Mobile";
  if (/windows|macintosh|linux|x11|cros/i.test(userAgent)) return "Desktop";

  return "Unknown";
}
