<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        return $this->cartFor($request)->load('items.product.images');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $cart = $this->cartFor($request);
        $product = Product::findOrFail($data['product_id']);

        if ($product->is_sold || $product->stock <= 0) {
            return response()->json(['message' => "{$product->name} is sold and cannot be added to cart."], 422);
        }

        $item = $cart->items()->firstOrNew(['product_id' => $product->id]);
        $item->quantity = min($product->stock, ($item->quantity ?? 0) + $data['quantity']);
        $item->save();

        return $cart->fresh()->load('items.product.images');
    }

    public function update(Request $request, int $productId)
    {
        $data = $request->validate(['quantity' => ['required', 'integer', 'min:0']]);
        $cart = $this->cartFor($request);
        $item = $cart->items()->where('product_id', $productId)->firstOrFail();

        if ($data['quantity'] === 0) {
            $item->delete();
        } else {
            $product = Product::findOrFail($productId);
            if ($product->is_sold || $product->stock <= 0) {
                return response()->json(['message' => "{$product->name} is sold and cannot stay in cart."], 422);
            }
            $item->update(['quantity' => min($product->stock, $data['quantity'])]);
        }

        return $cart->fresh()->load('items.product.images');
    }

    public function destroy(Request $request, int $productId)
    {
        $cart = $this->cartFor($request);
        $cart->items()->where('product_id', $productId)->delete();

        return $cart->fresh()->load('items.product.images');
    }

    private function cartFor(Request $request): Cart
    {
        return Cart::firstOrCreate(['user_id' => $request->user()->id]);
    }
}
