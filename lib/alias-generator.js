import crypto from 'crypto';

const adjectives = [
  'Brave', 'Gentle', 'Fierce', 'Quiet', 'Calm', 'Bright', 'Kind', 'Wise', 'Bold', 'Swift',
  'Happy', 'Proud', 'Strong', 'Sunny', 'Cool', 'Lucky', 'Wild', 'Silent', 'Mighty', 'Clever',
  'Golden', 'Silver', 'Crystal', 'Crimson', 'Azure', 'Jade', 'Violet', 'Amber', 'Coral', 'Pearl',
  'Cosmic', 'Lunar', 'Solar', 'Stellar', 'Astral', 'Mystic', 'Magic', 'Secret', 'Hidden', 'Noble'
];

const nouns = [
  'Lotus', 'Tulip', 'Rose', 'Lily', 'Orchid', 'Daisy', 'Iris', 'Fern', 'Ivy', 'Willow',
  'Phoenix', 'Dragon', 'Eagle', 'Falcon', 'Hawk', 'Raven', 'Dove', 'Swan', 'Robin', 'Lark',
  'River', 'Ocean', 'Mountain', 'Forest', 'Meadow', 'Valley', 'Star', 'Moon', 'Sun', 'Cloud',
  'Seeker', 'Dreamer', 'Thinker', 'Wanderer', 'Traveler', 'Healer', 'Guide', 'Friend', 'Soul', 'Spirit'
];

/**
 * Generates a deterministic, anonymous alias from a user ID.
 * @param {string} userId - The unique identifier of the user (e.g., Clerk User ID).
 * @returns {string} - A two-word alias like "Brave Lotus".
 */
export function generateAlias(userId) {
  if (!userId) {
    return 'Anonymous User';
  }

  // Create a fast, deterministic hash of the userId
  const hash = crypto.createHash('sha256').update(userId).digest('hex');
  
  // Use parts of the hash to pick indices
  const adjIndex = parseInt(hash.substring(0, 8), 16) % adjectives.length;
  const nounIndex = parseInt(hash.substring(8, 16), 16) % nouns.length;

  return `${adjectives[adjIndex]} ${nouns[nounIndex]}`;
}
