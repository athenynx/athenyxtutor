// Strict child-safe content guardrails for COPPA / Family safety

const FORBIDDEN_WORDS = [
  'kill', 'murder', 'gun', 'weapon', 'knife', 'stab', 'bomb', 'suicide', 'die', 'dead',
  'blood', 'gore', 'sex', 'sexual', 'porn', 'nude', 'naked', 'erotic', 'hate',
  'racist', 'terror', 'drugs', 'cocaine', 'marijuana', 'weed', 'vape', 'cigarette',
  'alcohol', 'beer', 'vodka', 'whiskey', 'gambling', 'casino', 'betting', 'curse', 'swear',
  'hack', 'exploit', 'password', 'credit card', 'ssn', 'social security'
];

export interface SafetyCheckResult {
  isSafe: boolean;
  reason?: string;
  suggestedTopic?: string;
}

export function evaluateStudentInput(text: string): SafetyCheckResult {
  const normalized = text.toLowerCase().trim();

  if (!normalized) {
    return { isSafe: false, reason: "Your question seems empty! What would you like to explore today?" };
  }

  if (normalized.length > 500) {
    return { isSafe: false, reason: "Whoa, that's a super long question! Can you ask it in a few simple sentences for Athenyx?" };
  }

  // Check forbidden keywords
  for (const word of FORBIDDEN_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(normalized)) {
      return {
        isSafe: false,
        reason: "Let's stay safe and curious! Athenyx loves exploring science, space, nature, math, and fun stories instead.",
        suggestedTopic: "science"
      };
    }
  }

  // Personal privacy check (protecting child PII)
  const phonePattern = /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/;
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/;
  if (phonePattern.test(normalized) || emailPattern.test(normalized)) {
    return {
      isSafe: false,
      reason: "To protect your privacy and safety, please do not share phone numbers or email addresses with Athenyx!"
    };
  }

  return { isSafe: true };
}

export const CHILD_SAFE_REDIRECT_PROMPTS = [
  "Why do stars twinkle in the night sky?",
  "How do plants drink water through their roots?",
  "What is the biggest creature living in our ocean?",
  "Can you teach me a super fun multiplication trick?",
  "Tell me a short bedtime riddle about animals!"
];
