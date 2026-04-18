# evonet-linkpay-shoplazza-app
A Shoplazza payment app and its backend server to integrate LinkPay with Shoplazza.

## Architechture
* Web server - ExpressJS
* Database - Postgres
* In-memory queue - Redis BullMQ

## Development
1. Prepare an ngrok tunnel link (Create an account at https://ngrok.com/ if you don't have one yet)
2. Config app at Shoplazza partner portal
3. Run `./setup.sh` to create .env files
4. Update necessary values in the .env files
5. Copy `docker-compose.local.yaml` to `docker-compose.override.yml`
6. Start docker containers `docker compose up`
```
docker compose up -d
```
1. Start ngrok tunnel
```
ngrok http --url=example.ngrok-free.dev 8080
```

### Prisma
To update database schema
1. Edit ./api/src/prisma.schema
2. Run `yarn prisma format` to format prisma.schema file
3. Run `yarn prisma generate` to update typescript type definitions.
4. Run `yarn prisma dev --name="example"` to create SQL migration file
5. Run `yarn prisma deploy` to run migration on the connected database

## Database
accounts - LinkPay account credentials. Inserted per merchant request by LinkPay customer service before payment app installation
stores - Shoplazza store information. Inserted on payment app installation.
payments - This table is to hold transaction information neccessary for communication between Shoplazza and LinkPay.
