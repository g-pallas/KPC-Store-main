<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\Request;

class ProductReviewController extends Controller
{
    public function index(Request $request, Product $product)
    {
        return [
            'reviews' => $product->reviews()
                ->with('user:id,name')
                ->latest()
                ->get(),
            'can_review' => $request->user()
                ? $this->reviewableOrder($request, $product) !== null
                : false,
        ];
    }

    public function store(Request $request, Product $product)
    {
        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'body' => ['required', 'string', 'min:8', 'max:2000'],
        ]);

        $order = $this->reviewableOrder($request, $product);

        if (! $order) {
            return response()->json([
                'message' => 'You can review this product after a delivered order is confirmed received, and only once per product.',
            ], 422);
        }

        $review = ProductReview::create([
            'user_id' => $request->user()->id,
            'product_id' => $product->id,
            'order_id' => $order->id,
            'rating' => $data['rating'],
            'body' => $data['body'],
        ]);

        ProductReview::refreshProductStats($product);

        return response()->json($review->load('user:id,name'), 201);
    }

    private function reviewableOrder(Request $request, Product $product): ?Order
    {
        if (ProductReview::where('user_id', $request->user()->id)->where('product_id', $product->id)->exists()) {
            return null;
        }

        return $request->user()
            ->orders()
            ->where('status', 'completed')
            ->whereNotNull('received_at')
            ->whereHas('items', fn ($query) => $query->where('product_id', $product->id))
            ->latest()
            ->first();
    }
}
