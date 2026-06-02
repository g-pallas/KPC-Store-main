<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@kpc.test'],
            ['name' => 'KPC Admin', 'password' => Hash::make('password'), 'role' => 'admin']
        );

        $customer = User::updateOrCreate(
            ['email' => 'customer@kpc.test'],
            ['name' => 'KPC Customer', 'password' => Hash::make('password'), 'role' => 'customer']
        );

        $categories = collect([
            ['Processors', 'c1.png'],
            ['Motherboard', 'c2.png'],
            ['Graphics Card', 'c3.png'],
            ['Memory', 'c4.png'],
            ['Solid State Drives', 'c5-1.jpg'],
            ['Hard Disk Drives', 'c6-r1.png'],
            ['Power Supply', 'c7-r.png'],
            ['Headphones', 'r1-3.png'],
            ['Laptop', 'r2-1.png'],
            ['Monitors', 'r4.png'],
            ['Mouse', 'r6.jpg'],
            ['Keyboard', 'ts4.webp'],
            ['Cooling', 'ts5.jpg'],
        ])->mapWithKeys(function ($item) {
            $category = Category::updateOrCreate(
                ['slug' => Str::slug($item[0])],
                ['name' => $item[0], 'image' => "/images/{$item[1]}"]
            );

            return [$category->name => $category];
        });

        $products = [
            [
                'name' => 'Logitech G PRO X 2',
                'category' => 'Headphones',
                'brand' => 'Logitech',
                'price' => 12416,
                'old_price' => 13799,
                'stock' => 12,
                'rating' => 4.4,
                'review_count' => 6,
                'primary_image' => 'r1-3.png',
                'images' => ['r1-3.png', 'logitech1.png', 'logitech2.png', 'logitech3.png', 'logitech4.png', 'logitech5.png', 'logitech6.png', 'logitech7.png'],
                'is_new' => true,
                'summary' => 'Pro-grade wireless gaming headset with immersive sound, comfortable ear pads, and multiple connection options.',
                'specifications' => ['Width' => '176 mm', 'Depth' => '95 mm', 'Height' => '189 mm', 'Weight' => '345 g', 'Charging cable length' => '1.8 m'],
            ],
            [
                'name' => 'Lenovo Legion Pro 7i (Gen 8)',
                'category' => 'Laptop',
                'brand' => 'Lenovo',
                'price' => 207000,
                'old_price' => 249999,
                'stock' => 5,
                'rating' => 0,
                'review_count' => 0,
                'primary_image' => 'r2-1.png',
                'images' => ['r2-1.png', 'lenovo1.png', 'lenovo2.png', 'lenovo3.png', 'lenovo4.png'],
                'is_new' => true,
                'summary' => 'High-performance Legion gaming laptop for heavy workloads, streaming, and competitive play.',
                'specifications' => ['Processor' => 'Intel Core i9 class', 'Display' => '16-inch gaming display', 'Memory' => 'DDR5', 'Storage' => 'NVMe SSD'],
            ],
            [
                'name' => 'G.Skill Trident Z5 RGB DDR5-6000',
                'category' => 'Memory',
                'brand' => 'G.Skill',
                'price' => 8000,
                'old_price' => 11250,
                'stock' => 24,
                'primary_image' => 'r3.webp',
                'images' => ['r3.webp', 'gskill1.png', 'gskill2.png', 'gskill3.png'],
                'is_new' => true,
                'summary' => 'Fast DDR5 RGB memory kit for modern gaming and workstation builds.',
                'specifications' => ['Type' => 'DDR5', 'Speed' => '6000 MT/s', 'Lighting' => 'RGB'],
            ],
            [
                'name' => 'Asus ROG Swift OLED PG32UCDM',
                'category' => 'Monitors',
                'brand' => 'ASUS',
                'price' => 49460.75,
                'old_price' => 52000.15,
                'stock' => 7,
                'primary_image' => 'r4.png',
                'images' => ['r4.png'],
                'is_new' => true,
                'summary' => 'Premium ROG OLED monitor with vivid color and high-refresh gaming performance.',
                'specifications' => ['Panel' => 'OLED', 'Use' => 'Gaming and creator display'],
            ],
            [
                'name' => 'Intel Core i7-14700K',
                'category' => 'Processors',
                'brand' => 'Intel',
                'price' => 26495,
                'old_price' => 26995,
                'stock' => 18,
                'primary_image' => 'r5-1.webp',
                'images' => ['r5-1.webp'],
                'is_new' => true,
                'summary' => 'Unlocked Intel Core desktop processor for powerful gaming and productivity systems.',
                'specifications' => ['Socket' => 'LGA1700', 'Series' => 'Intel Core i7'],
            ],
            [
                'name' => 'Razer DeathAdder V3 Pro',
                'category' => 'Mouse',
                'brand' => 'RAZER',
                'price' => 8295,
                'old_price' => 11459,
                'stock' => 16,
                'rating' => 4.7,
                'review_count' => 8,
                'primary_image' => 'r6.jpg',
                'images' => ['r6.jpg'],
                'is_new' => true,
                'summary' => 'Lightweight wireless esports mouse with ergonomic shape and long battery life.',
                'specifications' => ['Form factor' => 'Right-handed', 'Connectivity' => 'Wireless', 'Battery life' => 'Up to 90 hours'],
            ],
            [
                'name' => 'Ryzen 7 5700x',
                'category' => 'Processors',
                'brand' => 'AMD',
                'price' => 9765.99,
                'old_price' => 14355.99,
                'stock' => 20,
                'rating' => 4.7,
                'primary_image' => 'ts1.jpg',
                'images' => ['ts1.jpg'],
                'is_hot' => true,
                'is_top_seller' => true,
                'summary' => 'Popular AMD Ryzen processor for efficient gaming and multitasking builds.',
                'specifications' => ['Series' => 'Ryzen 7', 'Use' => 'Gaming desktop'],
            ],
            [
                'name' => 'RX 6600 XT',
                'category' => 'Graphics Card',
                'brand' => 'ASUS',
                'price' => 13579,
                'old_price' => 14779,
                'stock' => 9,
                'rating' => 4.6,
                'primary_image' => 'ts23.jpg',
                'images' => ['ts23.jpg'],
                'is_hot' => true,
                'is_top_seller' => true,
                'summary' => 'Value-focused graphics card for smooth 1080p gaming.',
                'specifications' => ['GPU' => 'Radeon RX 6600 XT', 'Use' => 'Gaming'],
            ],
            [
                'name' => 'RTX 4060',
                'category' => 'Graphics Card',
                'brand' => 'INNO3D',
                'price' => 20825,
                'old_price' => 21999,
                'stock' => 11,
                'rating' => 4.4,
                'primary_image' => 'ts3.png',
                'images' => ['ts3.png'],
                'is_hot' => true,
                'is_top_seller' => true,
                'summary' => 'Modern NVIDIA graphics card for efficient gaming PCs.',
                'specifications' => ['GPU' => 'GeForce RTX 4060', 'Use' => 'Gaming'],
            ],
            [
                'name' => 'Razer Ornata V3 X',
                'category' => 'Keyboard',
                'brand' => 'Razer',
                'price' => 2295,
                'old_price' => 3459,
                'stock' => 15,
                'rating' => 4.5,
                'primary_image' => 'ts4.webp',
                'images' => ['ts4.webp'],
                'is_hot' => true,
                'is_top_seller' => true,
                'summary' => 'Slim gaming keyboard with vivid lighting and comfortable typing.',
                'specifications' => ['Type' => 'Gaming keyboard', 'Lighting' => 'RGB'],
            ],
            [
                'name' => 'DeepCool RF120S',
                'category' => 'Cooling',
                'brand' => 'DeepCool',
                'price' => 416,
                'old_price' => 249,
                'stock' => 40,
                'rating' => 4.8,
                'primary_image' => 'ts5.jpg',
                'images' => ['ts5.jpg'],
                'is_hot' => true,
                'is_top_seller' => true,
                'summary' => 'Affordable RGB cooling fan for gaming PC builds.',
                'specifications' => ['Type' => 'Case fan', 'Lighting' => 'RGB'],
            ],
        ];

        foreach ($products as $productData) {
            $imageNames = $productData['images'];
            unset($productData['images']);
            $categoryName = $productData['category'];
            unset($productData['category']);

            $product = Product::updateOrCreate(
                ['slug' => Str::slug($productData['name'])],
                [
                    ...$productData,
                    'category_id' => $categories[$categoryName]->id,
                    'primary_image' => "/images/{$productData['primary_image']}",
                    'is_hot' => $productData['is_hot'] ?? false,
                    'is_new' => $productData['is_new'] ?? false,
                    'is_top_seller' => $productData['is_top_seller'] ?? false,
                    'rating' => $productData['rating'] ?? 0,
                    'review_count' => $productData['review_count'] ?? 0,
                ]
            );

            $product->images()->delete();
            foreach ($imageNames as $index => $imageName) {
                $product->images()->create(['path' => "/images/{$imageName}", 'sort_order' => $index]);
            }
        }

        Product::query()->update(['rating' => 0, 'review_count' => 0]);

        $reviewOrder = Order::updateOrCreate(
            ['order_number' => 'KPC-SEED-REVIEWS'],
            [
                'user_id' => $customer->id,
                'customer_name' => $customer->name,
                'email' => $customer->email,
                'phone' => '09171234567',
                'shipping_address' => 'Cebu, Consolacion, Jugan',
                'shipping_method' => 'standard',
                'payment_method' => 'cod',
                'status' => 'completed',
                'delivered_at' => now()->subDays(3),
                'received_at' => now()->subDays(2),
                'subtotal' => 20711,
                'shipping_total' => 0,
                'total' => 20711,
            ]
        );

        foreach ([
            ['slug' => 'logitech-g-pro-x-2', 'rating' => 5, 'body' => 'Delivered fast and packed securely. The headset arrived in perfect condition and sounds excellent.'],
            ['slug' => 'razer-deathadder-v3-pro', 'rating' => 5, 'body' => 'Light, responsive, and comfortable for long gaming sessions. Worth the price.'],
        ] as $reviewData) {
            $product = Product::where('slug', $reviewData['slug'])->first();
            if (! $product) {
                continue;
            }

            $reviewOrder->items()->updateOrCreate(
                ['product_id' => $product->id],
                [
                    'product_name' => $product->name,
                    'unit_price' => $product->price,
                    'quantity' => 1,
                    'line_total' => $product->price,
                ]
            );

            ProductReview::updateOrCreate(
                ['user_id' => $customer->id, 'product_id' => $product->id],
                [
                    'order_id' => $reviewOrder->id,
                    'rating' => $reviewData['rating'],
                    'body' => $reviewData['body'],
                ]
            );

            ProductReview::refreshProductStats($product);
        }
    }
}
