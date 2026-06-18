<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => config('app.name'),
        'message' => 'Laravel backend for the BG Remover Nuxt frontend.',
        'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),
        'healthcheck' => url('/api/health'),
    ]);
});
