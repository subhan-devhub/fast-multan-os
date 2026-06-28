/**
 * Strips HTML tags from input strings to prevent HTML injection.
 * @param {string} str 
 * @returns {string}
 */
export const stripHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '');
};

/**
 * Validates that the input length is within the max limit.
 * @param {string} str 
 * @param {number} maxLength 
 * @returns {boolean} True if within limit, false otherwise
 */
export const validateLength = (str, maxLength = 500) => {
  if (typeof str !== 'string') return true;
  return str.length <= maxLength;
};

/**
 * Validates that the input doesn't contain malformed code signatures.
 * Returns false if the input matches HTML tags, Javascript handlers,
 * SSTI brackets, SQL patterns, or program code block expressions.
 * @param {string} str 
 * @returns {boolean} True if format is valid, false if malformed
 */
export const validateInputFormat = (str) => {
  if (typeof str !== 'string') return true;

  // Check for HTML/XML tag markers
  const hasHtmlTags = /<[^>]+>/g.test(str);

  // Check for inline JavaScript event handlers or javascript: protocol
  const hasJsHandlers = /(javascript\s*:|onclick\s*=|onload\s*=|onerror\s*=)/i.test(str);

  // Check for SSTI expression templates or JS string interpolation
  const hasTemplateBrackets = /(\{\{[\s\S]*?\}\})|(\$\{[\s\S]*?\})/.test(str);

  // Check for obvious SQL statement patterns
  const hasSqlPatterns = /\b(select\s+.*?\s+from|insert\s+into|drop\s+table|delete\s+from|union\s+select)\b/i.test(str);

  // Check for programming functions and common scripts calls
  const hasCodeSignatures = /\b(function\s*\(|console\.log\(|alert\()/.test(str);

  if (hasHtmlTags || hasJsHandlers || hasTemplateBrackets || hasSqlPatterns || hasCodeSignatures) {
    return false;
  }
  return true;
};

/**
 * Checks that the file size is within limits.
 * @param {File} file 
 * @param {number} maxSizeBytes Default is 10MB (10 * 1024 * 1024)
 * @returns {boolean} True if file is within limits, false if oversized
 */
export const validateFileSize = (file, maxSizeBytes = 10 * 1024 * 1024) => {
  if (!file) return true;
  return file.size <= maxSizeBytes;
};
