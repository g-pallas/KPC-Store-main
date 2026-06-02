<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'images', 'detailImages'])->latest();

        if ($search = $request->query('search')) {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('brand', 'like', "%{$search}%")
                    ->orWhere('summary', 'like', "%{$search}%");
            });
        }

        if ($category = $request->query('category')) {
            $query->whereHas('category', fn ($builder) => $builder->where('slug', $category));
        }

        if ($request->boolean('hot')) {
            $query->where('is_hot', true);
        }

        if ($request->boolean('new')) {
            $query->where('is_new', true);
        }

        if ($request->boolean('top')) {
            $query->where('is_top_seller', true);
        }

        return response()->json($query->paginate((int) $request->query('per_page', 24)));
    }

    public function show(string $slug)
    {
        return Product::with(['category', 'images', 'detailImages', 'reviews.user:id,name'])
            ->where('slug', $slug)
            ->firstOrFail();
    }

    public function categories()
    {
        return Category::orderBy('id')->get();
    }

    public function hot()
    {
        return Product::with(['category', 'images', 'detailImages'])->where('is_hot', true)->get();
    }

    public function newArrivals()
    {
        return Product::with(['category', 'images', 'detailImages'])->where('is_new', true)->get();
    }
}
