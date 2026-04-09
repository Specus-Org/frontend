.PHONY: dev build lint format install api clean help

APP ?=
MODULE ?=

ifdef MODULE
FILTER := $(MODULE)
else ifdef APP
FILTER := @specus/$(APP)
endif

# Development (starts all apps)
dev:
ifdef FILTER
	pnpm --filter $(FILTER) run dev
else
	pnpm dev
endif

# Production build
build:
ifdef FILTER
	pnpm --filter $(FILTER) run build
else
	pnpm build
endif

# Run ESLint
lint:
ifdef FILTER
	pnpm --filter $(FILTER) run lint
else
	pnpm lint
endif

# Format code with Prettier
format:
	pnpm format

# Install dependencies
install:
	pnpm install

# Fetch OpenAPI spec and generate client
api:
ifdef FILTER
	pnpm --filter $(FILTER) run api
else
	pnpm api
endif

# Clean build artifacts and node_modules
clean:
	pnpm turbo clean
	find . -name 'node_modules' -type d -prune -exec rm -rf {} +
	find . -name '.next' -type d -prune -exec rm -rf {} +

# Show Makefile usage
help:
	@printf '%s\n' \
		'Usage:' \
		'  make <target>                 Run target for the whole workspace' \
		'  make <target> APP=web        Run target for app alias @specus/web' \
		'  make <target> APP=admin      Run target for app alias @specus/admin' \
		'  make <target> MODULE=@specus/ui  Run target for a specific workspace package' \
		'' \
		'Targets:' \
		'  dev build lint format install api clean help'
