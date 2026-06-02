<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()
            ->orders()
            ->with('items.product')
            ->latest()
            ->get();
    }

    public function confirmReceived(Request $request, Order $order)
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        if ($order->status !== 'delivered') {
            return response()->json(['message' => 'This order can be confirmed only after it has been marked delivered.'], 422);
        }

        $order->update([
            'status' => 'completed',
            'received_at' => now(),
        ]);

        return $order->load('items.product');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email'],
            'phone' => ['required', 'string', 'max:40'],
            'shipping_address' => ['required', 'string'],
            'shipping_method' => ['required', 'string', 'max:80'],
            'payment_method' => ['required', Rule::in(Order::PAYMENT_METHODS)],
            'notes' => ['nullable', 'string'],
            'items' => ['required_without:use_server_cart', 'array'],
            'items.*.product_id' => ['required_with:items', 'exists:products,id'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
            'use_server_cart' => ['boolean'],
        ]);

        $items = $this->resolveItems($request, $data);

        if ($items === []) {
            return response()->json(['message' => 'Your cart is empty.'], 422);
        }

        return DB::transaction(function () use ($request, $data, $items) {
            $subtotal = 0;
            foreach ($items as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);
                if ($product->is_sold) {
                    abort(422, "{$product->name} is sold and cannot be ordered.");
                }
                if ($product->stock < $item['quantity']) {
                    abort(422, "{$product->name} does not have enough stock.");
                }
                $subtotal += $product->price * $item['quantity'];
            }

            $shippingTotal = $data['shipping_method'] === 'express' ? 250 : 0;

            $order = Order::create([
                'user_id' => $request->user()?->id,
                'order_number' => 'KPC-'.now()->format('YmdHis').'-'.random_int(100, 999),
                'customer_name' => $data['customer_name'] ?? $request->user()?->name,
                'email' => $data['email'],
                'phone' => $data['phone'],
                'shipping_address' => $data['shipping_address'],
                'shipping_method' => $data['shipping_method'],
                'payment_method' => $data['payment_method'],
                'status' => 'pending',
                'subtotal' => $subtotal,
                'shipping_total' => $shippingTotal,
                'total' => $subtotal + $shippingTotal,
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($items as $item) {
                $product = Product::findOrFail($item['product_id']);
                $quantity = $item['quantity'];
                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit_price' => $product->price,
                    'quantity' => $quantity,
                    'line_total' => $product->price * $quantity,
                ]);
                $product->decrement('stock', $quantity);
            }

            if ($request->user()) {
                Cart::where('user_id', $request->user()->id)->first()?->items()->delete();
            }

            return response()->json($order->load('items'), 201);
        });
    }

    private function resolveItems(Request $request, array $data): array
    {
        if (($data['use_server_cart'] ?? false) && $request->user()) {
            return Cart::firstOrCreate(['user_id' => $request->user()->id])
                ->items()
                ->get(['product_id', 'quantity'])
                ->toArray();
        }

        return $data['items'] ?? [];
    }
}
