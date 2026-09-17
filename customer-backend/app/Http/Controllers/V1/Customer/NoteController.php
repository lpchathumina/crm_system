<?php

declare(strict_types=1);

namespace App\Http\Controllers\V1\Customer;

use App\Infrastructure\Persistence\Eloquent\Models\Note;
use App\Shared\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class NoteController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $notes = Note::with('user:id,name')
            ->when($request->notable_type, fn($q) => $q->where('notable_type', $request->notable_type))
            ->when($request->notable_id, fn($q) => $q->where('notable_id', $request->notable_id))
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at')
            ->paginate($request->get('per_page', 20));

        return $this->paginatedResponse($notes);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'required|string',
            'notable_type' => 'nullable|string',
            'notable_id' => 'nullable|integer',
            'is_pinned' => 'nullable|boolean',
            'tags' => 'nullable|array',
        ]);

        $validated['organization_id'] = $request->user()->organization_id;
        $validated['user_id'] = $request->user()->id;
        $validated['is_pinned'] = $validated['is_pinned'] ?? false;

        $note = Note::create($validated);

        return $this->successResponse($note->load('user:id,name'), 'Note created', 201);
    }

    public function show(int $id): JsonResponse
    {
        $note = Note::with('user:id,name')->findOrFail($id);
        return $this->successResponse($note);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $note = Note::findOrFail($id);

        $validated = $request->validate([
            'content' => 'sometimes|string',
            'is_pinned' => 'sometimes|boolean',
            'tags' => 'nullable|array',
        ]);

        $note->update($validated);
        return $this->successResponse($note, 'Note updated');
    }

    public function destroy(int $id): JsonResponse
    {
        Note::findOrFail($id)->delete();
        return $this->successResponse(null, 'Note deleted');
    }
}
