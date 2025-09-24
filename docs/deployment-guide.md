# Deployment Guide

## Docker Compose

1. Build and start services:
   docker compose up -d --build

2. Access:
   - Frontend: <http://localhost:3000>
   - Backend: <http://localhost:8080>
   - DB: localhost:5432 (PostgreSQL)

## Environment Variables

- SPRING_PROFILES_ACTIVE (backend)
- SPRING_DATASOURCE_URL, SPRING_DATASOURCE_USERNAME, SPRING_DATASOURCE_PASSWORD (backend DB)
