<?php

declare(strict_types=1);

namespace App\Http\Controllers\V1\Admin;

use App\Infrastructure\Persistence\Eloquent\Models\SystemSetting;
use App\Shared\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class SettingController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $settings = SystemSetting::when(
            $request->group,
            fn($q) => $q->where('group', $request->group)
        )->get()->groupBy('group');

        return $this->successResponse($settings);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate(['settings' => 'required|array']);

        foreach ($request->settings as $key => $value) {
            SystemSetting::updateOrCreate(
                ['key' => $key],
                ['value' => is_array($value) ? json_encode($value) : $value]
            );
        }

        return $this->successResponse(null, 'Settings updated successfully');
    }
}
