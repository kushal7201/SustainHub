#!/bin/bash
npm install --legacy-peer-deps
CI=false GENERATE_SOURCEMAP=false npm run build
