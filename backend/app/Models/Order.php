<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    public const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
    public const PAYMENT_METHODS = ['cod', 'gcash', 'paypal', 'card', 'bank_transfer'];

    protected $fillable = [
        'user_id',
        'order_number',
        'customer_name',
        'email',
        'phone',
        'shipping_address',
        'shipping_method',
        'payment_method',
        'status',
        'delivered_at',
        'received_at',
        'subtotal',
        'shipping_total',
        'total',
        'notes',
    ];

    protected $casts = [
        'delivered_at' => 'datetime',
        'received_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public static function factorylessCreateForTest(User $user): self
    {
        return self::create([
            'user_id' => $user->id,
            'order_number' => 'KPC-TEST-'.random_int(1000, 9999),
            'customer_name' => $user->name,
            'email' => $user->email,
            'phone' => '09171234567',
            'shipping_address' => 'Cebu City',
            'shipping_method' => 'standard',
            'payment_method' => 'cod',
            'status' => 'pending',
            'subtotal' => 100,
            'shipping_total' => 0,
            'total' => 100,
        ]);
    }
}
