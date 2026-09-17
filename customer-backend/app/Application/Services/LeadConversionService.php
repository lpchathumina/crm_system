<?php

declare(strict_types=1);

namespace App\Application\Services;

use App\Infrastructure\Persistence\Eloquent\Models\Activity;
use App\Infrastructure\Persistence\Eloquent\Models\Contact;
use App\Infrastructure\Persistence\Eloquent\Models\Customer;
use App\Infrastructure\Persistence\Eloquent\Models\Deal;
use App\Infrastructure\Persistence\Eloquent\Models\Lead;
use App\Infrastructure\Persistence\Eloquent\Models\Notification;
use App\Infrastructure\Persistence\Eloquent\Models\OrgUser;
use Exception;
use Illuminate\Support\Facades\DB;

class LeadConversionService
{
    public function convert(Lead $lead, array $data, OrgUser $user): array
    {
        if ($lead->status === 'converted') {
            throw new Exception('This lead has already been converted.');
        }

        return DB::transaction(function () use ($lead, $data, $user) {
            $orgId = $lead->organization_id;

            // 1. Customer: link existing or create new
            if (!empty($data['customer_id'])) {
                $customer = Customer::where('organization_id', $orgId)->findOrFail($data['customer_id']);
            } else {
                $customerName = $data['company_name'] ?? $lead->title;
                $customer = Customer::firstOrCreate(
                    [
                        'organization_id' => $orgId,
                        'name' => $customerName,
                    ],
                    [
                        'organization_id' => $orgId,
                        'owner_id' => $user->id,
                        'email' => $data['email'] ?? null,
                        'phone' => $data['phone'] ?? null,
                        'company' => $customerName,
                        'status' => 'active',
                        'source' => $lead->source ?? 'lead_conversion',
                    ]
                );
            }

            // 2. Contact: create or link contact
            $contact = null;
            if (!empty($data['create_contact']) || !empty($data['first_name'])) {
                $firstName = $data['first_name'] ?? 'Contact';
                $lastName = $data['last_name'] ?? $customer->name;
                $contact = Contact::create([
                    'organization_id' => $orgId,
                    'customer_id' => $customer->id,
                    'owner_id' => $user->id,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $data['email'] ?? null,
                    'phone' => $data['phone'] ?? null,
                    'title' => $data['job_title'] ?? 'Decision Maker',
                    'is_primary' => true,
                ]);
            }

            // 3. Deal / Opportunity: create deal if requested
            $deal = null;
            if (!empty($data['create_deal']) || isset($data['deal_title'])) {
                $deal = Deal::create([
                    'organization_id' => $orgId,
                    'customer_id' => $customer->id,
                    'owner_id' => $user->id,
                    'title' => $data['deal_title'] ?? ("Deal - " . $customer->name),
                    'stage' => $data['stage'] ?? 'proposal',
                    'value' => $data['deal_value'] ?? ($lead->estimated_value ?? 10000.00),
                    'currency' => $data['currency'] ?? 'USD',
                    'probability' => $data['probability'] ?? ($lead->probability ?? 60),
                    'expected_close_date' => $data['expected_close_date'] ?? now()->addMonth()->format('Y-m-d'),
                ]);
            }

            // 4. Mark Lead as converted
            $lead->update([
                'status' => 'converted',
                'customer_id' => $customer->id,
            ]);

            // 5. Log activity
            Activity::create([
                'organization_id' => $orgId,
                'user_id' => $user->id,
                'actable_type' => Customer::class,
                'actable_id' => $customer->id,
                'type' => 'lead_converted',
                'subject' => "Lead '{$lead->title}' converted to customer '{$customer->name}'",
                'description' => "Converted by {$user->name}. " . ($deal ? "Created deal '{$deal->title}' for \${$deal->value}." : ''),
                'occurred_at' => now(),
            ]);

            // 6. Notification
            Notification::create([
                'organization_id' => $orgId,
                'user_id' => $user->id,
                'type' => 'lead_converted',
                'title' => 'Lead Successfully Converted',
                'message' => "Lead '{$lead->title}' converted to {$customer->name}.",
                'data' => [
                    'lead_id' => $lead->id,
                    'customer_id' => $customer->id,
                    'deal_id' => $deal?->id,
                ],
                'is_read' => false,
            ]);

            return [
                'lead' => $lead->fresh(),
                'customer' => $customer,
                'contact' => $contact,
                'deal' => $deal,
            ];
        });
    }
}
