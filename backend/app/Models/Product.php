<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'brand',
        'price',
        'old_price',
        'stock',
        'rating',
        'review_count',
        'summary',
        'specifications',
        'primary_image',
        'is_hot',
        'is_new',
        'is_top_seller',
        'is_sold',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'old_price' => 'decimal:2',
        'rating' => 'decimal:1',
        'specifications' => 'array',
        'is_hot' => 'boolean',
        'is_new' => 'boolean',
        'is_top_seller' => 'boolean',
        'is_sold' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function detailImages(): HasMany
    {
        return $this->hasMany(ProductDetailImage::class)->orderBy('sort_order');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class)->latest();
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
