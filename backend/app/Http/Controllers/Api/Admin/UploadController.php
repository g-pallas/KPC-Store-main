<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function image(Request $request)
    {
        $data = $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:4096'],
            'folder' => ['nullable', 'string', 'max:40'],
        ]);

        $folder = in_array($data['folder'] ?? '', ['products', 'categories'], true)
            ? $data['folder']
            : 'products';

        $path = $request->file('image')->store($folder, 'public');

        return response()->json([
            'path' => "/storage/{$path}",
            'url' => asset("storage/{$path}"),
        ], 201);
    }
}
