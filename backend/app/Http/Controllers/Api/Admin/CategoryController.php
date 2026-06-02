<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        return Category::withCount('products')->orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $category = Category::create($this->validated($request));

        return response()->json($category, 201);
    }

    public function update(Request $request, Category $category)
    {
        $category->update($this->validated($request, $category->id));

        return $category;
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json(['message' => 'Category deleted']);
    }

    private function validated(Request $request, ?int $categoryId = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:categories,slug'.($categoryId ? ",{$categoryId}" : '')],
            'image' => ['nullable', 'string'],
        ]);
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        return $data;
    }
}
