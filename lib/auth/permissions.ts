import type { User, AccountType } from "@/types";

/**
 * Check if a user has VIP account type
 */
export const isVipUser = (user: User | null | undefined): boolean => {
  return user?.accountType === "VIP";
};

/**
 * Check if a user has a specific account type
 */
export const hasAccountType = (
  user: User | null | undefined,
  accountType: AccountType
): boolean => {
  return user?.accountType === accountType;
};

/**
 * Check if a user can access AI features
 * Currently only VIP users have access to AI features
 */
export const canAccessAiFeatures = (user: User | null | undefined): boolean => {
  return isVipUser(user);
};

/**
 * Get account type badge color classes
 */
export const getAccountTypeBadgeClasses = (
  accountType: AccountType
): string => {
  switch (accountType) {
    case "VIP":
      return "bg-linear-to-r from-yellow-500 to-amber-500 text-white";
    case "STANDARD":
      return "bg-secondary text-secondary-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};
