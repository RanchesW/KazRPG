#!/bin/bash
# Test script for signup API

echo "Testing signup API..."

curl -s -w "\nHTTP Status: %{http_code}\n" \
  -X POST "http://localhost:3000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "firstName": "Test", 
    "lastName": "User",
    "password": "Test123!",
    "confirmPassword": "Test123!",
    "language": "RU",
    "isGM": false
  }'
