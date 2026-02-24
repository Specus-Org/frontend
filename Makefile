.PHONY: dev build start lint format clean install

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

# Clean build artifacts and node_modules
clean:
	rm -rf .next node_modules
