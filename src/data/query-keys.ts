export const queryKeys = {
  liked: ['liked'] as const,
  preferences: ['preferences'] as const,
  vehicle: (id: string) => ['vehicle', id] as const,
  /** Bumped to restart the swipe deck, e.g. after resetting all swipes. */
  feedEpoch: ['feed-epoch'] as const,
};
