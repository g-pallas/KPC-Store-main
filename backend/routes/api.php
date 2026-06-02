<?php

use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\UploadController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductReviewController;
use App\Http\Controllers\Api\SubscriberController;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Subscriber;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/hot', [ProductController::class, 'hot']);
Route::get('/products/new-arrivals', [ProductController::class, 'newArrivals']);
Route::get('/products/{product}/reviews', [ProductReviewController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/categories', [ProductController::class, 'categories']);
Route::post('/subscribers', [SubscriberController::class, 'store']);

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/orders', [OrderController::class, 'store'])->middleware('auth:sanctum');
Route::post('/guest-orders', [OrderController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $request) => $request->user());
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{productId}', [CartController::class, 'update']);
    Route::delete('/cart/{productId}', [CartController::class, 'destroy']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders/{order}/confirm-received', [OrderController::class, 'confirmReceived']);
    Route::post('/products/{product}/reviews', [ProductReviewController::class, 'store']);

    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('dashboard', fn () => [
            'products' => Product::count(),
            'categories' => Category::count(),
            'orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'customers' => User::where('role', 'customer')->count(),
            'subscribers' => Subscriber::count(),
            'revenue' => Order::whereIn('status', ['processing', 'shipped', 'delivered', 'completed'])->sum('total'),
        ]);
        Route::apiResource('products', AdminProductController::class)->except(['show']);
        Route::apiResource('categories', AdminCategoryController::class)->except(['show']);
        Route::post('uploads/image', [UploadController::class, 'image']);
        Route::get('orders', [AdminOrderController::class, 'index']);
        Route::put('orders/{order}/status', [AdminOrderController::class, 'updateStatus']);
        Route::get('subscribers', fn () => Subscriber::latest()->get());
        Route::delete('subscribers/{subscriber}', function (Subscriber $subscriber) {
            $subscriber->delete();

            return response()->json(['message' => 'Subscriber deleted']);
        });
        Route::get('users', fn () => User::select('id', 'name', 'email', 'role', 'created_at')->latest()->get());
        Route::put('users/{user}/role', function (Request $request, User $user) {
            $validated = $request->validate([
                'role' => ['required', 'in:admin,customer'],
            ]);

            $user->update(['role' => $validated['role']]);

            return $user->only(['id', 'name', 'email', 'role', 'created_at']);
        });
        Route::delete('users/{user}', function (Request $request, User $user) {
            abort_if($request->user()->id === $user->id, 422, 'You cannot delete your own admin account.');

            $user->delete();

            return response()->json(['message' => 'User deleted']);
        });
    });
});
