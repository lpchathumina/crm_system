<?php

namespace Database\Seeders;

use App\Infrastructure\Persistence\Eloquent\Models\Activity;
use App\Infrastructure\Persistence\Eloquent\Models\Contact;
use App\Infrastructure\Persistence\Eloquent\Models\Customer;
use App\Infrastructure\Persistence\Eloquent\Models\Deal;
use App\Infrastructure\Persistence\Eloquent\Models\Lead;
use App\Infrastructure\Persistence\Eloquent\Models\Note;
use App\Infrastructure\Persistence\Eloquent\Models\Notification;
use App\Infrastructure\Persistence\Eloquent\Models\OrgUser;
use App\Infrastructure\Persistence\Eloquent\Models\Organization;
use App\Infrastructure\Persistence\Eloquent\Models\Task;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ── 1. Permissions & Roles ──────────────────────────────────────────
        $permissions = [
            'customer.dashboard.view',
            'customer.customers.view', 'customer.customers.create', 'customer.customers.update', 'customer.customers.delete',
            'customer.contacts.view', 'customer.contacts.create', 'customer.contacts.update', 'customer.contacts.delete',
            'customer.leads.view', 'customer.leads.create', 'customer.leads.update', 'customer.leads.delete',
            'customer.deals.view', 'customer.deals.create', 'customer.deals.update', 'customer.deals.delete',
            'customer.tasks.view', 'customer.tasks.create', 'customer.tasks.update', 'customer.tasks.delete',
            'customer.reports.view',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'sanctum']);
        }

        $orgAdminRole = Role::firstOrCreate(['name' => 'org-admin', 'guard_name' => 'sanctum']);
        $orgAdminRole->givePermissionTo(Permission::all());

        $salesManagerRole = Role::firstOrCreate(['name' => 'sales-manager', 'guard_name' => 'sanctum']);
        $salesManagerRole->givePermissionTo(Permission::whereNotIn('name', [
            'customer.customers.delete',
            'customer.deals.delete',
        ])->get());

        $salesRepRole = Role::firstOrCreate(['name' => 'sales-rep', 'guard_name' => 'sanctum']);
        $salesRepRole->givePermissionTo([
            'customer.dashboard.view',
            'customer.customers.view', 'customer.customers.create', 'customer.customers.update',
            'customer.contacts.view', 'customer.contacts.create', 'customer.contacts.update',
            'customer.leads.view', 'customer.leads.create', 'customer.leads.update',
            'customer.deals.view', 'customer.deals.create', 'customer.deals.update',
            'customer.tasks.view', 'customer.tasks.create', 'customer.tasks.update',
        ]);

        // ── 2. Organizations ───────────────────────────────────────────────
        $acme = Organization::firstOrCreate(
            ['slug' => 'acme-corp'],
            [
                'name' => 'Acme Corporation',
                'email' => 'contact@acme.example.com',
                'phone' => '+1-555-0100',
                'website' => 'https://acme.example.com',
                'is_active' => true,
                'plan' => 'enterprise',
                'timezone' => 'America/New_York',
                'settings' => [
                    'currency' => 'USD',
                    'fiscal_year_start' => '01-01',
                    'lead_scoring_enabled' => true,
                ],
            ]
        );

        $globalTech = Organization::firstOrCreate(
            ['slug' => 'global-tech'],
            [
                'name' => 'Global Tech Solutions',
                'email' => 'info@globaltech.example.com',
                'phone' => '+1-555-0200',
                'website' => 'https://globaltech.example.com',
                'is_active' => true,
                'plan' => 'professional',
                'timezone' => 'Europe/London',
                'settings' => [
                    'currency' => 'EUR',
                    'fiscal_year_start' => '04-01',
                ],
            ]
        );

        // ── 3. Org Users ───────────────────────────────────────────────────
        $adminUser = OrgUser::firstOrCreate(
            ['organization_id' => $acme->id, 'email' => 'sales@acme.com'],
            [
                'name' => 'Sarah Connor',
                'password' => Hash::make('Password@123'),
                'is_active' => true,
                'phone' => '+1-555-0101',
                'timezone' => 'America/New_York',
                'email_verified_at' => now(),
            ]
        );
        $adminUser->assignRole('org-admin');

        $salesRep1 = OrgUser::firstOrCreate(
            ['organization_id' => $acme->id, 'email' => 'john.doe@acme.com'],
            [
                'name' => 'John Doe',
                'password' => Hash::make('Password@123'),
                'is_active' => true,
                'phone' => '+1-555-0102',
                'timezone' => 'America/New_York',
                'email_verified_at' => now(),
            ]
        );
        $salesRep1->assignRole('sales-rep');

        $salesRep2 = OrgUser::firstOrCreate(
            ['organization_id' => $acme->id, 'email' => 'jane.smith@acme.com'],
            [
                'name' => 'Jane Smith',
                'password' => Hash::make('Password@123'),
                'is_active' => true,
                'phone' => '+1-555-0103',
                'timezone' => 'America/New_York',
                'email_verified_at' => now(),
            ]
        );
        $salesRep2->assignRole('sales-manager');

        // ── 4. Customers (Companies/Accounts) ──────────────────────────────
        $customersData = [
            [
                'name' => 'Apex Software Systems',
                'email' => 'procurement@apexsoftware.example.com',
                'phone' => '+1-415-555-1001',
                'company' => 'Apex Software Systems Inc.',
                'website' => 'https://apexsoftware.example.com',
                'address' => '500 Howard Street, Suite 400',
                'city' => 'San Francisco',
                'state' => 'CA',
                'country' => 'United States',
                'postal_code' => '94105',
                'status' => 'active',
                'source' => 'referral',
                'owner_id' => $adminUser->id,
                'tags' => ['enterprise', 'saas', 'priority-a'],
                'notes' => 'Key enterprise account looking to consolidate legacy CRM and ERP workflows.',
            ],
            [
                'name' => 'Starlight Logistics',
                'email' => 'ops@starlightlogistics.example.com',
                'phone' => '+1-312-555-2002',
                'company' => 'Starlight Global Logistics',
                'website' => 'https://starlightlogistics.example.com',
                'address' => '1200 W Monroe St',
                'city' => 'Chicago',
                'state' => 'IL',
                'country' => 'United States',
                'postal_code' => '60607',
                'status' => 'active',
                'source' => 'inbound',
                'owner_id' => $salesRep1->id,
                'tags' => ['logistics', 'mid-market', 'fleet'],
                'notes' => 'National logistics provider with 350+ drivers. Interested in field tracking API.',
            ],
            [
                'name' => 'Nexus Retail Partners',
                'email' => 'partners@nexusretail.example.com',
                'phone' => '+1-212-555-3003',
                'company' => 'Nexus Retail Group',
                'website' => 'https://nexusretail.example.com',
                'address' => '75 Rockefeller Plaza',
                'city' => 'New York',
                'state' => 'NY',
                'country' => 'United States',
                'postal_code' => '10019',
                'status' => 'active',
                'source' => 'outbound',
                'owner_id' => $salesRep2->id,
                'tags' => ['retail', 'omnichannel', 'pos'],
                'notes' => 'Multi-location fashion brand with 48 brick-and-mortar stores and e-commerce.',
            ],
            [
                'name' => 'Quantum Health Innovations',
                'email' => 'admin@quantumhealth.example.com',
                'phone' => '+1-617-555-4004',
                'company' => 'Quantum Health Inc.',
                'website' => 'https://quantumhealth.example.com',
                'address' => '200 Cambridge St',
                'city' => 'Boston',
                'state' => 'MA',
                'country' => 'United States',
                'postal_code' => '02114',
                'status' => 'active',
                'source' => 'conference',
                'owner_id' => $adminUser->id,
                'tags' => ['healthcare', 'hipaa', 'biotech'],
                'notes' => 'Strict compliance requirements. Requires custom business associate agreement.',
            ],
            [
                'name' => 'Horizon Digital Media',
                'email' => 'accounts@horizonmedia.example.com',
                'phone' => '+1-512-555-5005',
                'company' => 'Horizon Media LLC',
                'website' => 'https://horizonmedia.example.com',
                'address' => '300 Congress Ave',
                'city' => 'Austin',
                'state' => 'TX',
                'country' => 'United States',
                'postal_code' => '78701',
                'status' => 'active',
                'source' => 'website',
                'owner_id' => $salesRep1->id,
                'tags' => ['media', 'marketing', 'agency'],
                'notes' => 'Rapidly expanding digital marketing firm.',
            ],
        ];

        $createdCustomers = [];
        foreach ($customersData as $c) {
            $createdCustomers[] = Customer::firstOrCreate(
                ['organization_id' => $acme->id, 'email' => $c['email']],
                array_merge($c, ['organization_id' => $acme->id])
            );
        }

        // ── 5. Contacts ────────────────────────────────────────────────────
        $contactsData = [
            [
                'customer_id' => $createdCustomers[0]->id,
                'first_name' => 'Marcus',
                'last_name' => 'Vance',
                'email' => 'mvance@apexsoftware.example.com',
                'phone' => '+1-415-555-1100',
                'title' => 'Chief Technology Officer',
                'department' => 'Engineering',
                'is_primary' => true,
                'tags' => ['decision-maker', 'technical-evaluator'],
            ],
            [
                'customer_id' => $createdCustomers[0]->id,
                'first_name' => 'Elena',
                'last_name' => 'Rostova',
                'email' => 'erostova@apexsoftware.example.com',
                'phone' => '+1-415-555-1101',
                'title' => 'Head of Procurement',
                'department' => 'Finance',
                'is_primary' => false,
                'tags' => ['finance', 'contract-signer'],
            ],
            [
                'customer_id' => $createdCustomers[1]->id,
                'first_name' => 'David',
                'last_name' => 'Miller',
                'email' => 'dmiller@starlightlogistics.example.com',
                'phone' => '+1-312-555-2200',
                'title' => 'VP of Fleet Operations',
                'department' => 'Operations',
                'is_primary' => true,
                'tags' => ['operations', 'champion'],
            ],
            [
                'customer_id' => $createdCustomers[2]->id,
                'first_name' => 'Chloe',
                'last_name' => 'Bennett',
                'email' => 'cbennett@nexusretail.example.com',
                'phone' => '+1-212-555-3300',
                'title' => 'Director of Retail Sales',
                'department' => 'Sales',
                'is_primary' => true,
                'tags' => ['sales', 'sponsor'],
            ],
            [
                'customer_id' => $createdCustomers[3]->id,
                'first_name' => 'Dr. Robert',
                'last_name' => 'Lang',
                'email' => 'rlang@quantumhealth.example.com',
                'phone' => '+1-617-555-4400',
                'title' => 'Chief Medical Information Officer',
                'department' => 'Executive',
                'is_primary' => true,
                'tags' => ['executive', 'compliance'],
            ],
        ];

        foreach ($contactsData as $contact) {
            Contact::firstOrCreate(
                ['organization_id' => $acme->id, 'email' => $contact['email']],
                array_merge($contact, [
                    'organization_id' => $acme->id,
                    'owner_id' => $adminUser->id,
                ])
            );
        }

        // ── 6. Leads ───────────────────────────────────────────────────────
        $leadsData = [
            [
                'title' => 'Enterprise License Inbound Inquiry',
                'description' => 'Interested in 250 enterprise seats with custom SAML SSO and dedicated tenant storage.',
                'status' => 'qualified',
                'source' => 'website',
                'estimated_value' => 85000.00,
                'probability' => 70,
                'expected_close_date' => now()->addMonths(2)->format('Y-m-d'),
                'customer_id' => $createdCustomers[0]->id,
                'owner_id' => $adminUser->id,
                'tags' => ['high-value', 'q3-target'],
            ],
            [
                'title' => 'Fleet Tracking Integration',
                'description' => 'Real-time GPS API webhook integration into custom CRM dashboard.',
                'status' => 'contacted',
                'source' => 'referral',
                'estimated_value' => 45000.00,
                'probability' => 50,
                'expected_close_date' => now()->addMonths(1)->format('Y-m-d'),
                'customer_id' => $createdCustomers[1]->id,
                'owner_id' => $salesRep1->id,
                'tags' => ['api', 'custom-integration'],
            ],
            [
                'title' => 'Omnichannel POS Rollout',
                'description' => 'Sync retail customer transaction history across all 48 store POS terminals.',
                'status' => 'proposal',
                'source' => 'inbound',
                'estimated_value' => 62000.00,
                'probability' => 80,
                'expected_close_date' => now()->addWeeks(3)->format('Y-m-d'),
                'customer_id' => $createdCustomers[2]->id,
                'owner_id' => $salesRep2->id,
                'tags' => ['omnichannel', 'pos'],
            ],
            [
                'title' => 'HIPAA Compliant Patient CRM',
                'description' => 'Evaluating HIPAA compliance guarantees and on-premise encryption gateways.',
                'status' => 'new',
                'source' => 'conference',
                'estimated_value' => 120000.00,
                'probability' => 30,
                'expected_close_date' => now()->addMonths(4)->format('Y-m-d'),
                'customer_id' => $createdCustomers[3]->id,
                'owner_id' => $adminUser->id,
                'tags' => ['hipaa', 'enterprise'],
            ],
        ];

        foreach ($leadsData as $l) {
            Lead::firstOrCreate(
                ['organization_id' => $acme->id, 'title' => $l['title']],
                array_merge($l, ['organization_id' => $acme->id])
            );
        }

        // ── 7. Deals ───────────────────────────────────────────────────────
        $dealsData = [
            [
                'title' => 'Apex Software - 250 Enterprise Seats Renewal',
                'description' => 'Annual SaaS subscription renewal with premium 24/7 SLA.',
                'stage' => 'negotiation',
                'value' => 125000.00,
                'currency' => 'USD',
                'probability' => 85,
                'expected_close_date' => now()->addDays(15)->format('Y-m-d'),
                'customer_id' => $createdCustomers[0]->id,
                'owner_id' => $adminUser->id,
                'tags' => ['renewal', 'tier-1'],
            ],
            [
                'title' => 'Starlight Global Fleet Telematics Add-on',
                'description' => 'Fleet tracking telemetry module for 350 vehicles.',
                'stage' => 'proposal',
                'value' => 48000.00,
                'currency' => 'USD',
                'probability' => 60,
                'expected_close_date' => now()->addMonths(1)->format('Y-m-d'),
                'customer_id' => $createdCustomers[1]->id,
                'owner_id' => $salesRep1->id,
                'tags' => ['expansion', 'hardware-api'],
            ],
            [
                'title' => 'Nexus Retail POS Cloud Sync Module',
                'stage' => 'closed_won',
                'value' => 74500.00,
                'currency' => 'USD',
                'probability' => 100,
                'expected_close_date' => now()->subDays(5)->format('Y-m-d'),
                'actual_close_date' => now()->subDays(5)->format('Y-m-d'),
                'customer_id' => $createdCustomers[2]->id,
                'owner_id' => $salesRep2->id,
                'tags' => ['won', 'q2-win'],
            ],
            [
                'title' => 'Horizon Media Growth Plan Upgrade',
                'stage' => 'qualification',
                'value' => 28000.00,
                'currency' => 'USD',
                'probability' => 40,
                'expected_close_date' => now()->addMonths(2)->format('Y-m-d'),
                'customer_id' => $createdCustomers[4]->id,
                'owner_id' => $salesRep1->id,
                'tags' => ['upgrade'],
            ],
        ];

        foreach ($dealsData as $d) {
            Deal::firstOrCreate(
                ['organization_id' => $acme->id, 'title' => $d['title']],
                array_merge($d, ['organization_id' => $acme->id])
            );
        }

        // ── 8. Tasks ───────────────────────────────────────────────────────
        $tasksData = [
            [
                'title' => 'Prepare Security Review Document for Apex CTO',
                'description' => 'Send SOC2 Type II report and architecture overview to Marcus Vance.',
                'status' => 'todo',
                'priority' => 'high',
                'due_date' => now()->addDays(2),
                'owner_id' => $adminUser->id,
                'assigned_to' => $adminUser->id,
                'tags' => ['security', 'soc2'],
            ],
            [
                'title' => 'Demo Telematics Webhooks with Starlight Ops Team',
                'description' => 'Present live webhook demonstration on staging server.',
                'status' => 'in_progress',
                'priority' => 'medium',
                'due_date' => now()->addDays(4),
                'owner_id' => $salesRep1->id,
                'assigned_to' => $salesRep1->id,
                'tags' => ['demo', 'technical'],
            ],
            [
                'title' => 'Finalize Master Services Agreement for Nexus Retail',
                'description' => 'Coordinate with legal team on indemnity and SLA clauses.',
                'status' => 'completed',
                'priority' => 'urgent',
                'due_date' => now()->subDays(2),
                'completed_at' => now()->subDays(1),
                'owner_id' => $salesRep2->id,
                'assigned_to' => $salesRep2->id,
                'tags' => ['legal', 'contracts'],
            ],
        ];

        foreach ($tasksData as $t) {
            Task::firstOrCreate(
                ['organization_id' => $acme->id, 'title' => $t['title']],
                array_merge($t, ['organization_id' => $acme->id])
            );
        }

        // ── 9. Activities ──────────────────────────────────────────────────
        Activity::firstOrCreate(
            [
                'organization_id' => $acme->id,
                'subject' => 'Initial Discovery Call with Apex Software CTO',
            ],
            [
                'user_id' => $adminUser->id,
                'type' => 'call',
                'description' => 'Discussed current bottlenecks with legacy CRM and requirements for automated pipeline reporting.',
                'occurred_at' => now()->subDays(3),
                'metadata' => ['duration_minutes' => 45, 'outcome' => 'advanced-to-proposal'],
            ]
        );

        Activity::firstOrCreate(
            [
                'organization_id' => $acme->id,
                'subject' => 'On-site Technical Review at Starlight Fleet Depot',
            ],
            [
                'user_id' => $salesRep1->id,
                'type' => 'meeting',
                'description' => 'Reviewed depot dispatcher hardware and field mobile network connectivity requirements.',
                'occurred_at' => now()->subDays(1),
                'metadata' => ['attendees_count' => 5, 'location' => 'Chicago HQ'],
            ]
        );

        // ── 10. Notes ──────────────────────────────────────────────────────
        Note::firstOrCreate(
            [
                'organization_id' => $acme->id,
                'content' => 'Apex Software requires quarterly security compliance attestations and single sign-on with Okta.',
            ],
            [
                'user_id' => $adminUser->id,
                'is_pinned' => true,
                'tags' => ['compliance', 'security'],
            ]
        );

        // ── 11. CRM Notifications ──────────────────────────────────────────
        Notification::firstOrCreate(
            [
                'organization_id' => $acme->id,
                'user_id' => $adminUser->id,
                'title' => 'Deal Closed: Nexus Retail Cloud Sync',
            ],
            [
                'type' => 'deal_won',
                'message' => 'Congratulations! Deal "Nexus Retail POS Cloud Sync Module" ($74,500.00) was marked as Won.',
                'data' => ['deal_id' => 3, 'amount' => 74500.00],
                'is_read' => false,
            ]
        );

        Notification::firstOrCreate(
            [
                'organization_id' => $acme->id,
                'user_id' => $salesRep1->id,
                'title' => 'New Lead Assigned: Fleet Tracking Integration',
            ],
            [
                'type' => 'lead_assigned',
                'message' => 'You have been assigned a new lead: "Fleet Tracking Integration" ($45,000.00).',
                'data' => ['lead_id' => 2],
                'is_read' => true,
                'read_at' => now()->subHours(4),
            ]
        );
    }
}
