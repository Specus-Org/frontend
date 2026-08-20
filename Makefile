.PHONY: dev dev-app dev-admin build build-app build-admin lint lint-app lint-admin \
	format install api clean help

.DEFAULT_GOAL := help

APP ?=
MODULE ?=

ifdef MODULE
FILTER := $(MODULE)
else ifdef APP
FILTER := @specus/$(APP)
endif

# Workspace aliases
WEB   := @specus/web
ADMIN := @specus/admin

# Development (starts all apps)
dev:
ifdef FILTER
	pnpm --filter $(FILTER) run dev
else
	pnpm dev
endif

# Development (web app only)
dev-app:
	pnpm --filter $(WEB) run dev

# Development (admin only)
dev-admin:
	pnpm --filter $(ADMIN) run dev

# Production build
build:
ifdef FILTER
	pnpm --filter $(FILTER) run build
else
	pnpm build
endif

# Production build (web app only)
build-app:
	pnpm --filter $(WEB) run build

# Production build (admin only)
build-admin:
	pnpm --filter $(ADMIN) run build

# Run ESLint
lint:
ifdef FILTER
	pnpm --filter $(FILTER) run lint
else
	pnpm lint
endif

# Run ESLint (web app only)
lint-app:
	pnpm --filter $(WEB) run lint

# Run ESLint (admin only)
lint-admin:
	pnpm --filter $(ADMIN) run lint

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
		'  make <target>                    Run target for the whole workspace' \
		'  make <target> APP=web            Run target for app alias @specus/web' \
		'  make <target> APP=admin          Run target for app alias @specus/admin' \
		'  make <target> MODULE=@specus/ui  Run target for a specific workspace package' \
		'' \
		'Development:' \
		'  dev          Start every app (turbo dev)' \
		'  dev-app      Start only the web app ($(WEB))' \
		'  dev-admin    Start only the admin app ($(ADMIN))' \
		'' \
		'Build:' \
		'  build        Build every app' \
		'  build-app    Build only the web app' \
		'  build-admin  Build only the admin app' \
		'' \
		'Quality:' \
		'  lint         Lint every package' \
		'  lint-app     Lint only the web app' \
		'  lint-admin   Lint only the admin app' \
		'  format       Format the repo with Prettier' \
		'' \
		'Misc:' \
		'  install      Install dependencies' \
		'  api          Fetch OpenAPI spec and generate the client' \
		'  clean        Remove build artifacts and node_modules' \
		'  help         Show this message'
