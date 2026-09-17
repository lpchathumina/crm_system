<?php

declare(strict_types=1);

namespace App\Http\Controllers\V1\Customer;

use App\Infrastructure\Persistence\Eloquent\Models\Contact;
use App\Infrastructure\Persistence\Eloquent\Models\Customer;
use App\Infrastructure\Persistence\Eloquent\Models\Deal;
use App\Infrastructure\Persistence\Eloquent\Models\Lead;
use App\Infrastructure\Persistence\Eloquent\Models\Task;
use App\Shared\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class SearchController extends Controller
{
    use ApiResponse;

    public function search(Request $request): JsonResponse
    {
        $q = trim((string) $request->get('q', ''));

        if (strlen($q) < 2) {
            return $this->successResponse([
                'customers' => [],
                'contacts' => [],
                'leads' => [],
                'deals' => [],
                'tasks' => [],
            ]);
        }

        $customers = Customer::where('name', 'like', "%{$q}%")
            ->orWhere('company', 'like', "%{$q}%")
            ->orWhere('email', 'like', "%{$q}%")
            ->limit(5)
            ->get(['id', 'name', 'company', 'email', 'phone', 'status']);

        $contacts = Contact::where('first_name', 'like', "%{$q}%")
            ->orWhere('last_name', 'like', "%{$q}%")
            ->orWhere('email', 'like', "%{$q}%")
            ->limit(5)
            ->get(['id', 'first_name', 'last_name', 'email', 'phone', 'title', 'customer_id']);

        $leads = Lead::where('title', 'like', "%{$q}%")
            ->orWhere('description', 'like', "%{$q}%")
            ->limit(5)
            ->get(['id', 'title', 'status', 'estimated_value']);

        $deals = Deal::where('title', 'like', "%{$q}%")
            ->limit(5)
            ->get(['id', 'title', 'stage', 'value', 'currency']);

        $tasks = Task::where('title', 'like', "%{$q}%")
            ->limit(5)
            ->get(['id', 'title', 'status', 'priority', 'due_date']);

        return $this->successResponse([
            'customers' => $customers,
            'contacts' => $contacts,
            'leads' => $leads,
            'deals' => $deals,
            'tasks' => $tasks,
        ]);
    }
}
