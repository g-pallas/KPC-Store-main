<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscriber;
use Illuminate\Http\Request;

class SubscriberController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate(['email' => ['required', 'email', 'max:255']]);

        return Subscriber::firstOrCreate($data);
    }
}
