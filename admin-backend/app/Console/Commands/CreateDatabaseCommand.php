<?php

namespace App\Console\Commands;

use Exception;
use Illuminate\Console\Command;
use PDO;

class CreateDatabaseCommand extends Command
{
    protected $signature = 'db:create {name? : The name of the database}';
    protected $description = 'Create the MySQL database if it does not already exist';

    public function handle(): int
    {
        $connection = config('database.default');
        $dbName = $this->argument('name') ?: config("database.connections.{$connection}.database");
        $host = config("database.connections.{$connection}.host", '127.0.0.1');
        $port = config("database.connections.{$connection}.port", '3306');
        $username = config("database.connections.{$connection}.username", 'root');
        $password = config("database.connections.{$connection}.password", '');

        if (!$dbName) {
            $this->error('Database name not specified.');
            return Command::FAILURE;
        }

        try {
            $pdo = new PDO("mysql:host={$host};port={$port}", $username, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            ]);
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
            $this->info("Database [{$dbName}] created or verified successfully on {$host}:{$port}.");
            return Command::SUCCESS;
        } catch (Exception $e) {
            $this->error("Failed to create database [{$dbName}]: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
