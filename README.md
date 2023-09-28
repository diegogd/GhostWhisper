# Ghost Whisper

## Instructions

You can follow the guide of this presentation on `doc/slides.md`

```sh
cd doc
npx @marp-team/marp-cli@latest slides.md --pdf --allow-local-files
```

To launch the slides in server mode:

```sh
PORT=8070 npx @marp-team/marp-cli@latest . -w -s
```

## Develop

To install the bun environment execute:

```sh
curl -fsSL https://bun.sh/install | bash
```

Install dependencies:

```sh
cd src
bun install
```

## Init Docker Compose with Ghost

- Copy the file `.env.example` to `.env` and complete the missing variables.
- Some details to obtain these keys are described in the [slides](./doc/slides.pdf).

```ini
BOT_TOKEN=bot_token
# JWT secrets - You can safely ignore it
SECRET=my_super_secret_jwt
# OpenAI Key https://platform.openai.com/account/api-keys
OPENAI_API_KEY=sk-...

# Pezzo integration
PEZZO_API_KEY=...
PEZZO_PROJECT_ID=...
PEZZO_PROMPTS=Spanish Casual|Polish Casual # Names of prompts defined in Pezzo
PEZZO_ENVIRONMENT=Production

# Ghost integration
GHOST_HOST=http://ghost:2368
GHOST_ADMIN_API_KEY=...
```

Start the containers to run the telegram bot and a Ghost instance.

```sh
docker-compose up -d 
```

To obtain `GHOST_ADMIN_API_KEY`:

- Open [Ghost link](http://localhost:8080/ghost) and complete the login information
- After creating the account go to [New custom integration](http://localhost:8080/ghost/#/settings/integrations/new)
and generate a new application.
- Copy the Admin API key to the `GHOST_ADMIN_API_KEY` key in the `.env` file and restart the server.
- Restart docker-compose: `docker-compose restart`