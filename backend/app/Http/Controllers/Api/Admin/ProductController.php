<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index()
    {
        return Product::with(['category', 'images', 'detailImages'])->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $galleryImages = $data['gallery_images'] ?? [];
        $detailImages = $data['detail_images'] ?? [];
        unset($data['gallery_images']);
        unset($data['detail_images']);

        $product = Product::create($data);
        $this->syncGalleryImages($product, $galleryImages);
        $this->syncDetailImages($product, $detailImages);

        return response()->json($product->load(['category', 'images', 'detailImages']), 201);
    }

    public function update(Request $request, Product $product)
    {
        $data = $this->validated($request, $product->id);
        $galleryImages = $data['gallery_images'] ?? [];
        $detailImages = $data['detail_images'] ?? [];
        unset($data['gallery_images']);
        unset($data['detail_images']);

        $product->update($data);
        $this->syncGalleryImages($product, $galleryImages);
        $this->syncDetailImages($product, $detailImages);

        return $product->load(['category', 'images', 'detailImages']);
    }

    public function destroy(Product $product)
    {
        if ($product->orderItems()->exists()) {
            return response()->json([
                'message' => 'This product is attached to existing orders. Mark it as sold instead of deleting it.',
            ], 422);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted']);
    }

    private function validated(Request $request, ?int $productId = null): array
    {
        $data = $request->validate([
            'category_id' => ['nullable', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug'.($productId ? ",{$productId}" : '')],
            'brand' => ['nullable', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'old_price' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'review_count' => ['nullable', 'integer', 'min:0'],
            'summary' => ['nullable', 'string'],
            'specifications' => ['nullable', 'array'],
            'primary_image' => ['nullable', 'string'],
            'gallery_images' => ['array'],
            'gallery_images.*' => ['string'],
            'detail_images' => ['array'],
            'detail_images.*' => ['string'],
            'is_hot' => ['boolean'],
            'is_new' => ['boolean'],
            'is_top_seller' => ['boolean'],
            'is_sold' => ['boolean'],
        ]);

        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        return $data;
    }

    private function syncGalleryImages(Product $product, array $paths): void
    {
        $product->images()->delete();

        foreach (array_values(array_filter($paths)) as $index => $path) {
            $product->images()->create([
                'path' => $path,
                'sort_order' => $index,
            ]);
        }
    }

    private function syncDetailImages(Product $product, array $paths): void
    {
        $product->detailImages()->delete();

        foreach (array_values(array_filter($paths)) as $index => $path) {
            $product->detailImages()->create([
                'path' => $path,
                'sort_order' => $index,
            ]);
        }
    }
}
