docker-up:
	docker compose up --build

docker-up-d:
	docker compose up -d --build

docker-down:
	docker compose down

docker-up-scale:
	docker compose up --scale 

docker-up-scale-d:
	docker compose up -d --scale
