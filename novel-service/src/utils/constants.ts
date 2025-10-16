import capitalize from 'lodash/capitalize';
import trim from 'lodash/trim';
import { Novel } from 'src/modules/novel/novel.entity';

export const cleanWhitespace = (text: string): string => {
  return trim(text).replace(/\s+/g, ' ');
};

export const formatSentenceCase = (text: string): string => {
  return capitalize(cleanWhitespace(text).replace(/\s+/g, ' ').toLowerCase());
};

export const formatStartCase = (text: string): string => {
  return text
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export function calculateWeightedHotScore(novel: Novel): number {
  // 1. Rating score với minimum threshold
  const minReviewsForRating = 5;
  const ratingScore =
    novel.numberOfReviews >= minReviewsForRating
      ? novel.averageRating / 5
      : 0.5; // Neutral score cho truyện mới

  // 2. Log scale cho reviews (không cap cứng)
  const reviewScore = Math.min(
    Math.log10(novel.numberOfReviews + 1) / Math.log10(500),
    1,
  );

  // 3. Views và votes
  const viewScore = Math.min(
    Math.log10(novel.numberOfViews + 1) / Math.log10(1000000),
    1,
  );
  const voteScore = Math.min(
    Math.log10(novel.numberOfVotes + 1) / Math.log10(40000),
    1,
  );

  // 4. Freshness decay mềm hơn (half-life 30 ngày thay vì 7)
  const daysSinceUpdate =
    (Date.now() -
      new Date(
        novel.latestPublishedChapterTime || novel.lastUpdatedAt,
      ).getTime()) /
    (1000 * 60 * 60 * 24);
  const freshness = Math.exp(-daysSinceUpdate / 30); // Exponential decay

  // 5. Điều chỉnh weights (freshness quan trọng hơn cho "hot")
  const weights = {
    rating: 0.2,
    reviews: 0.15,
    views: 0.25,
    votes: 0.15,
    freshness: 0.25, // Tăng từ 0.15 -> 0.25
  };

  const score =
    ratingScore * weights.rating +
    reviewScore * weights.reviews +
    viewScore * weights.views +
    voteScore * weights.votes +
    freshness * weights.freshness;

  // 6. Completion bonus nhỏ hơn và chỉ áp dụng nếu update gần đây
  const completionBonus =
    novel.isCompleted && daysSinceUpdate < 30 ? 1.05 : 1.0;

  return Math.min(score * completionBonus, 1); // Đảm bảo không vượt 1
}
