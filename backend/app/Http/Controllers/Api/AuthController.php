<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'cart' => ['array'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => 'customer',
        ]);

        $this->mergeGuestCart($user, $data['cart'] ?? []);

        return $this->tokenResponse($user);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'cart' => ['array'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $this->mergeGuestCart($user, $data['cart'] ?? []);

        return $this->tokenResponse($user);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out']);
    }

    private function tokenResponse(User $user)
    {
        return response()->json([
            'user' => $user,
            'token' => $user->createToken('kpc-store')->plainTextToken,
        ]);
    }

    private function mergeGuestCart(User $user, array $items): void
    {
        if ($items === []) {
            return;
        }

        $cart = Cart::firstOrCreate(['user_id' => $user->id]);

        foreach ($items as $item) {
            $product = Product::find($item['product_id'] ?? null);
            $quantity = max(1, (int) ($item['quantity'] ?? 1));

            if (! $product || $product->is_sold || $product->stock <= 0) {
                continue;
            }

            $cartItem = $cart->items()->firstOrNew(['product_id' => $product->id]);
            $cartItem->quantity = min($product->stock, ($cartItem->quantity ?? 0) + $quantity);
            $cartItem->save();
        }
    }
}
