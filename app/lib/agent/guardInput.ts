// lib/agent/guardInput.ts

export function guardInput(input: string): string | null {
    const cleaned = input.toLowerCase().trim();
  
    // 🚫 Obvious offensive content
    const blockedWords = [
      /fuck/, /shit/, /bitch/, /asshole/, /nazi/, /kill/, /rape/, /bomb/, /terror/i,
    ];
  
    // ⚠️ Dangerous commands
    const blockedPatterns = [
      /delete\s+all/i,
      /remove\s+everything/i,
      /clear\s+my\s+(calendar|inbox)/i,
      /drop\s+table/i,
    ];
  
    // 🧪 Gibberish or non-informative
    if (cleaned.length < 3 || /^[a-z]+$/i.test(cleaned) === false && /\s/.test(cleaned) === false) {
      return "Your message is too short or unclear. Please provide a more specific request.";
    }
  
    for (const pattern of [...blockedWords, ...blockedPatterns]) {
      if (pattern.test(cleaned)) {
        return "Your input contains unsafe or disallowed content.";
      }
    }
  
    return null; // ✅ Passed
  }
  