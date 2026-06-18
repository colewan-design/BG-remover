<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Google\Client as GoogleClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function google(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'credential' => ['nullable', 'string'],
            'access_token' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'A Google credential or access token is required.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $googleClientId = (string) config('services.google.client_id');

        if ($googleClientId === '') {
            return response()->json([
                'message' => 'Google authentication is not configured on the server.',
            ], 500);
        }

        $credential = $request->string('credential')->toString();
        $accessToken = $request->string('access_token')->toString();

        if ($credential === '' && $accessToken === '') {
            return response()->json([
                'message' => 'A Google credential or access token is required.',
            ], 422);
        }

        $payload = null;

        if ($credential !== '') {
            $client = new GoogleClient([
                'client_id' => $googleClientId,
            ]);

            $payload = $client->verifyIdToken($credential);
        } elseif ($accessToken !== '') {
            $response = Http::acceptJson()
                ->withToken($accessToken)
                ->get('https://openidconnect.googleapis.com/v1/userinfo');

            if ($response->ok()) {
                $payload = $response->json();
            }
        }

        if (!$payload) {
            return response()->json([
                'message' => 'The Google sign-in could not be verified.',
            ], 401);
        }

        $email = data_get($payload, 'email');
        $googleId = data_get($payload, 'sub');

        if (!$email || !$googleId) {
            return response()->json([
                'message' => 'Google did not return the required user information.',
            ], 422);
        }

        $user = User::query()->firstOrNew([
            'email' => $email,
        ]);

        $user->fill([
            'name' => data_get($payload, 'name', $email),
            'google_id' => $googleId,
            'avatar' => data_get($payload, 'picture'),
        ]);

        if (data_get($payload, 'email_verified') && !$user->email_verified_at) {
            $user->email_verified_at = now();
        }

        if (!$user->exists || !$user->password) {
            $user->password = Str::random(40);
        }

        $user->save();

        $token = $user->createToken('google-sign-in')->plainTextToken;

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Signed out successfully.',
        ]);
    }
}
