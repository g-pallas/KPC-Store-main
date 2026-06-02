<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductReview extends Model
{
    protected $fillable = ['user_id', 'product_id', 'order_id', 'rating', 'body'];

    protected $casts = [
        'rating' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public static function refreshProductStats(Product $product): void
    {
        $summary = self::where('product_id', $product->id)
            ->selectRaw('COUNT(*) as count, AVG(rating) as average_rating')
            ->first();

        $product->update([
            'rating' => round((float) ($summary->average_rating ?? 0), 1),
            'review_count' => (int) ($summary->count ?? 0),
        ]);
    }
}
