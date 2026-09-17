<?php

declare(strict_types=1);

namespace App\Http\Controllers\V1\Customer;

use App\Infrastructure\Persistence\Eloquent\Models\Task;
use App\Shared\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class TaskController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $tasks = Task::with('owner:id,name', 'assignee:id,name')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->priority, fn($q) => $q->where('priority', $request->priority))
            ->when($request->assigned_to, fn($q) => $q->where('assigned_to', $request->assigned_to))
            ->when($request->due_from, fn($q) => $q->whereDate('due_date', '>=', $request->due_from))
            ->when($request->due_to, fn($q) => $q->whereDate('due_date', '<=', $request->due_to))
            ->orderBy('due_date')
            ->paginate($request->get('per_page', 15));

        return $this->paginatedResponse($tasks);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'in:todo,in_progress,done,cancelled',
            'priority' => 'in:low,medium,high,urgent',
            'due_date' => 'nullable|date',
            'assigned_to' => 'nullable|integer',
            'taskable_id' => 'nullable|integer',
            'taskable_type' => 'nullable|string',
        ]);

        $data = $request->validated();
        $data['owner_id'] = $request->user()->id;
        $data['status'] = $data['status'] ?? Task::STATUS_TODO;
        $data['priority'] = $data['priority'] ?? Task::PRIORITY_MEDIUM;

        $task = Task::create($data);
        return $this->successResponse($task, 'Task created', 201);
    }

    public function show(int $id): JsonResponse
    {
        $task = Task::with('owner:id,name', 'assignee:id,name')->findOrFail($id);
        return $this->successResponse($task);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $task = Task::findOrFail($id);
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:todo,in_progress,done,cancelled',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'due_date' => 'nullable|date',
            'assigned_to' => 'nullable|integer',
        ]);

        $data = $request->validated();
        if (($data['status'] ?? null) === Task::STATUS_DONE && !$task->completed_at) {
            $data['completed_at'] = now();
        }

        $task->update($data);
        return $this->successResponse($task, 'Task updated');
    }

    public function destroy(int $id): JsonResponse
    {
        Task::findOrFail($id)->delete();
        return $this->successResponse(null, 'Task deleted');
    }

    public function toggleComplete(int $id): JsonResponse
    {
        $task = Task::findOrFail($id);
        $isDone = $task->status === Task::STATUS_DONE;
        $task->update([
            'status' => $isDone ? Task::STATUS_TODO : Task::STATUS_DONE,
            'completed_at' => $isDone ? null : now(),
        ]);

        return $this->successResponse($task, 'Task status updated');
    }
}
