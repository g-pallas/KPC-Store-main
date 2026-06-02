<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index()
    {
        return Order::with('items', 'user')->latest()->get();
    }

    public function updateStatus(Request $request, Order $order)
    {
        $data = $request->validate(['status' => ['required', Rule::in(Order::STATUSES)]]);
        if ($data['status'] === 'delivered' && ! $order->delivered_at) {
            $data['delivered_at'] = now();
        }
        if ($data['status'] !== 'completed') {
            $data['received_at'] = null;
        }
        $order->update($data);

        return $order->load('items', 'user');
    }
}
