#!/bin/bash
cd /app/frontend
exec npx http-server public -p 3000 -c-1 --cors
