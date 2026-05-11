'use client';

import { useState } from 'react';
import { Star, ThumbsUp, CheckCircle } from 'lucide-react';
import { Review } from '@prisma/client';
import { cn } from '@/lib/utils';

interface ReviewsProps {
  reviews: Review[];
  productId: string;
}

export function Reviews({ reviews, productId }: ReviewsProps) {
  const [helpfulFilter, setHelpfulFilter] = useState(false);
  
  const filteredReviews = helpfulFilter 
    ? reviews.sort((a, b) => b.helpfulCount - a.helpfulCount).slice(0, 5)
    : reviews;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 
      ? Math.round((reviews.filter(r => r.rating === rating).length / reviews.length) * 100)
      : 0
  }));

  if (reviews.length === 0) {
    return (
      <div className="border rounded-lg p-6 text-center">
        <p className="text-muted-foreground">暂无评价</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold">用户评价</h3>
      
      {/* 评分概览 */}
      <div className="flex items-center gap-8">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary">{avgRating}</div>
          <div className="flex gap-0.5 justify-center my-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "h-4 w-4",
                  star <= Math.round(Number(avgRating)) 
                    ? "fill-yellow-400 text-yellow-400" 
                    : "text-gray-300"
                )}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{reviews.length} 条评价</p>
        </div>
        
        <div className="flex-1 space-y-1">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-2 text-sm">
              <span className="w-3">{rating}</span>
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-400 rounded-full" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-muted-foreground text-xs">{percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 筛选 */}
      <div className="flex gap-2">
        <button
          onClick={() => setHelpfulFilter(false)}
          className={cn(
            "px-3 py-1 text-sm rounded-full border transition-colors",
            !helpfulFilter 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-gray-100"
          )}
        >
          全部评价
        </button>
        <button
          onClick={() => setHelpfulFilter(true)}
          className={cn(
            "px-3 py-1 text-sm rounded-full border transition-colors",
            helpfulFilter 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-gray-100"
          )}
        >
          最有帮助
        </button>
      </div>

      {/* 评价列表 */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="border-b pb-4 last:border-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">{review.userName || '匿名用户'}</span>
              {review.isVerified && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-3 w-3",
                      star <= review.rating 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground ml-auto">
                {new Date(review.createdAt).toLocaleDateString('zh-CN')}
              </span>
            </div>
            
            {review.title && (
              <p className="font-medium text-sm mb-1">{review.title}</p>
            )}
            
            {review.content && (
              <p className="text-sm text-muted-foreground mb-2">{review.content}</p>
            )}
            
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ThumbsUp className="h-3 w-3" />
              <span>有帮助 ({review.helpfulCount})</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}