all: frontend backend

.PHONY: clean
clean:
	rm -rf .parcel-cache
	rm -rf ./frontend/target

.PHONY: dev
dev:
	yarn start & cargo run

.PHONY: frontend
frontend:
	yarn install
	yarn build

.PHONY: backend
backend:
	cargo install --path .
	cargo build --release

POSTGRES_PASSWORD ?= password
.PHONY: docker-db
docker-db:
	docker run --name juhlakalu-postgres -e POSTGRES_PASSWORD="$(POSTGRES_PASSWORD)" -p 5432:5432 -d postgres

.PHONY: docker-db-stop
docker-db-stop:
	docker container stop juhlakalu-postgres

.PHONY: docker-db-remove
docker-db-remove:
	docker container rm juhlakalu-postgres

.PHONY: release
release:
	rm -rf ./release

	mkdir ./release
	cp ./target/release/juhlakalu ./release
	cp .env.example ./release/.env

	mkdir -p ./release/frontend/target
	cp -R ./frontend/target/ ./release/frontend/target/
