# Game-On API Postman Collections

This directory contains Postman collections and environments for testing the Game-On API.

## Collections

1. `auth-flow.json` - Authentication flow testing
2. `admin-flow.json` - Admin operations testing
3. `user-flow.json` - User operations testing

## Environments

1. `local.json` - Local development environment
2. `development.json` - Development server environment
3. `production.json` - Production environment

## Setup

1. Import the collections into Postman
2. Import and configure the appropriate environment
3. Run the collections in order:
   - Register a test user
   - Complete auth flow
   - Test protected endpoints 