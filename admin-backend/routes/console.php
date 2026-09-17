<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('db:create {name?}', function ($name = null) {
    $this->call(\App\Console\Commands\CreateDatabaseCommand::class, ['name' => $name]);
})->purpose('Create the MySQL database if it does not already exist');
