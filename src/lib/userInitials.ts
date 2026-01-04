/**
 * Generate user initials from display name or email
 */
export const getUserInitials = (displayName?: string | null, email?: string | null): string => {
  if (displayName) {
    const words = displayName.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  }
  
  if (email) {
    const localPart = email.split("@")[0];
    return localPart.slice(0, 2).toUpperCase();
  }
  
  return "U";
};

/**
 * Generate a consistent background color based on a string (name/email)
 */
export const getAvatarColor = (identifier: string): string => {
  // List of pleasant, accessible colors
  const colors = [
    "from-rose-400 to-pink-500",
    "from-violet-400 to-purple-500",
    "from-blue-400 to-indigo-500",
    "from-cyan-400 to-teal-500",
    "from-emerald-400 to-green-500",
    "from-amber-400 to-orange-500",
    "from-pink-400 to-rose-500",
    "from-indigo-400 to-violet-500",
    "from-teal-400 to-cyan-500",
    "from-fuchsia-400 to-pink-500",
  ];
  
  // Generate a hash from the identifier
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};
