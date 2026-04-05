.PHONY: dev build lint format install api clean

# Development (starts all apps)
dev:
	pnpm dev

# Production build
build:
	pnpm build

# Run ESLint
lint:
	pnpm lint

# Format code with Prettier
format:
	pnpm format

# Install dependencies
install:
	pnpm install

# Fetch OpenAPI spec and generate client
api:
	pnpm api

# Clean build artifacts and node_modules
clean:
	pnpm turbo clean
	find . -name 'node_modules' -type d -prune -exec rm -rf {} +
	find . -name '.next' -type d -prune -exec rm -rf {} +
