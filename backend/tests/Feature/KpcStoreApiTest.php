<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KpcStoreApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_catalog_endpoints_return_seeded_products(): void
    {
        $this->seed();

        $this->getJson('/api/products')
            ->assertOk()
            ->assertJsonFragment(['name' => 'Logitech G PRO X 2']);

        $this->getJson('/api/products/logitech-g-pro-x-2')
            ->assertOk()
            ->assertJsonPath('name', 'Logitech G PRO X 2');

        $this->getJson('/api/products/hot')
            ->assertOk()
            ->assertJsonFragment(['name' => 'Ryzen 7 5700x']);
    }

    public function test_customer_can_login_merge_guest_cart_and_update_server_cart(): void
    {
        $this->seed();
        $product = Product::where('slug', 'ryzen-7-5700x')->firstOrFail();

        $login = $this->postJson('/api/auth/login', [
            'email' => 'customer@kpc.test',
            'password' => 'password',
            'cart' => [['product_id' => $product->id, 'quantity' => 2]],
        ])->assertOk();

        $token = $login->json('token');

        $this->getJson('/api/cart', ['Authorization' => "Bearer {$token}"])
            ->assertOk()
            ->assertJsonPath('items.0.quantity', 2);

        $this->putJson("/api/cart/{$product->id}", ['quantity' => 1], ['Authorization' => "Bearer {$token}"])
            ->assertOk()
            ->assertJsonPath('items.0.quantity', 1);
    }

    public function test_guest_checkout_creates_order_and_decrements_stock(): void
    {
        $this->seed();
        $product = Product::where('slug', 'deepcool-rf120s')->firstOrFail();

        $this->postJson('/api/guest-orders', [
            'customer_name' => 'Guest Buyer',
            'email' => 'guest@example.com',
            'phone' => '09171234567',
            'shipping_address' => 'Cebu City',
            'shipping_method' => 'standard',
            'payment_method' => 'gcash',
            'items' => [['product_id' => $product->id, 'quantity' => 3]],
        ])->assertCreated()
            ->assertJsonPath('items.0.product_name', 'DeepCool RF120S');

        $this->assertDatabaseHas('orders', ['email' => 'guest@example.com', 'status' => 'pending']);
        $this->assertSame($product->stock - 3, $product->fresh()->stock);
    }

    public function test_admin_routes_are_protected_and_admin_can_update_order_status(): void
    {
        $this->seed();
        $customer = User::where('email', 'customer@kpc.test')->firstOrFail();
        $admin = User::where('email', 'admin@kpc.test')->firstOrFail();
        $order = Order::factorylessCreateForTest($customer);

        $this->actingAs($customer, 'sanctum')
            ->getJson('/api/admin/products')
            ->assertForbidden();

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/admin/orders/{$order->id}/status", ['status' => 'processing'])
            ->assertOk()
            ->assertJsonPath('status', 'processing');
    }

    public function test_customer_can_review_once_after_confirming_delivered_order_received(): void
    {
        $this->seed();
        $customer = User::where('email', 'customer@kpc.test')->firstOrFail();
        $product = Product::where('slug', 'deepcool-rf120s')->firstOrFail();
        $order = Order::factorylessCreateForTest($customer);
        $order->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'unit_price' => $product->price,
            'quantity' => 1,
            'line_total' => $product->price,
        ]);
        $order->update(['status' => 'delivered', 'delivered_at' => now()]);

        $this->actingAs($customer, 'sanctum')
            ->postJson("/api/products/{$product->id}/reviews", [
                'rating' => 5,
                'body' => 'Arrived safely and works well.',
            ])
            ->assertUnprocessable();

        $this->actingAs($customer, 'sanctum')
            ->postJson("/api/orders/{$order->id}/confirm-received")
            ->assertOk()
            ->assertJsonPath('status', 'completed');

        $this->actingAs($customer, 'sanctum')
            ->postJson("/api/products/{$product->id}/reviews", [
                'rating' => 5,
                'body' => 'Arrived safely and works well.',
            ])
            ->assertCreated();

        $this->actingAs($customer, 'sanctum')
            ->postJson("/api/products/{$product->id}/reviews", [
                'rating' => 4,
                'body' => 'Trying to review again.',
            ])
            ->assertUnprocessable();

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'rating' => 5,
            'review_count' => 1,
        ]);
    }
}
