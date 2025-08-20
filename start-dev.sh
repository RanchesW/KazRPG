#!/bin/bash
cd /workspaces/KazRPG
export NODE_ENV=development
export HOSTNAME=0.0.0.0
export PORT=3000
npm run dev -- --hostname 0.0.0.0 --port 3000
