.PHONY: dev build start lint format clean install fetch-openapi generate-api api

# Development
dev:
	npm run dev

# Production build
build:
	npm run build

# Start production server
start:
	npm run start

# Run ESLint
lint:
	npm run lint

# Format code with Prettier
format:
	npm run format

# Install dependencies
install:
	npm install

# Fetch OpenAPI spec from private backend repo
fetch-openapi:
	bash scripts/fetch-openapi.sh

# Generate TypeScript client from OpenAPI spec
generate-api: fetch-openapi
	npx openapi-ts

# Fetch spec and generate client (shorthand)
api: generate-api

# Clean build artifacts and node_modules
clean:
	rm -rf .next node_modules
