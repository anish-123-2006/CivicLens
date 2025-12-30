/**
 * Service for social sharing and municipal communication
 */

export interface ShareOptions {
  issueType: string;
  severity: string;
  description: string;
  address: string;
  imageUrl?: string;
  lat?: number;
  lng?: number;
}

/**
 * Generate Twitter share URL with pre-filled message
 */
export const generateTwitterShare = (options: ShareOptions): string => {
  const emoji = options.severity === 'High' ? '🚨' : '⚠️';
  const text = `${emoji} Found a ${options.severity} Severity ${options.issueType} at ${options.address}. 

"${options.description}"

Help our city by fixing this! Use #CivicLens to report civic issues. ${options.imageUrl ? '📸 Photo attached' : ''}`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&hashtags=CivicLens,FixOurCity`;
  return twitterUrl;
};

/**
 * Generate email share with pre-filled subject and body
 */
export const generateEmailShare = (options: ShareOptions): string => {
  const subject = `URGENT: ${options.severity} Severity ${options.issueType} at ${options.address}`;
  const body = `Dear Municipal Corporation,

I am reporting a ${options.severity} severity civic issue that needs immediate attention:

Issue Type: ${options.issueType}
Location: ${options.address}
Coordinates: ${options.lat}, ${options.lng}
Description: ${options.description}

This issue has been reported through CivicLens - a citizen civic reporting platform.

Please take necessary action to resolve this issue.

Regards,
A Concerned Citizen`;

  const mailtoUrl = `mailto:complaint@municipalcorp.gov?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return mailtoUrl;
};

/**
 * Generate WhatsApp share message
 */
export const generateWhatsAppShare = (options: ShareOptions): string => {
  const text = `🚨 Civic Issue Alert!\n\nType: ${options.issueType}\nSeverity: ${options.severity}\nLocation: ${options.address}\n\nDescription: ${options.description}\n\nReported via CivicLens 📍`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
};

/**
 * Generate reverse geocoding URL to get address from coordinates
 */
export const getAddressFromCoordinates = async (
  lat: number,
  lng: number,
  apiKey: string
): Promise<string> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.error('Error getting address:', error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};
