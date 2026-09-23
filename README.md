# Asset Management System

This is a small internal tool for tracking company assets, who they are assigned to, and the whole lifecycle around that. Think laptops, monitors, chairs, phones, anything a company hands out to its people. It keeps a record of what exists, who has what, what condition it is in, and a full history of everything that happened to it.

There are two kinds of users. Employees can see what is assigned to them, acknowledge receiving something, request a new asset or a return or a repair, and track the status of those requests. Administrators manage the actual inventory, review and approve requests, assign assets, create employee accounts, and see the bigger picture across departments.

## What it is built with

The frontend is React with Vite, and the whole thing is written in TypeScript. Styling is done with Tailwind. The backend is Express, also TypeScript, talking to a MySQL database through mysql2. Authentication is a plain JWT you get back from logging in and send along as a bearer token on every request after that.

Both sides used to be plain JavaScript and were converted to TypeScript in full, so everything in `client/src` and `server/src` is typed, with the exception of the one off migration and seed scripts under `server/src/scripts`, which are still JavaScript since they are run once and are not part of the running app.

## Project layout

`client` holds the React app. `server` holds the Express API. `database` holds a single SQL file with the full schema and some seed data, which gets loaded automatically the first time the database container starts up.

Inside `client/src` you will find `pages` for the actual screens, split loosely into `admin` and `employee` folders depending on who they are for, plus a few shared ones like the asset list and asset detail pages that both roles can reach. `components` holds the smaller reusable pieces like the modal, the status badges, the layout shell with the sidebar. `api` holds one file per resource, each one just wrapping the actual HTTP calls to the backend. `types.ts` has the shared shapes those calls return.

Inside `server/src`, `routes` just wires URLs to controller functions, `controllers` is where the actual logic and database queries live, `middleware` has the authentication and file upload handling, and `config` sets up the database connection pool and the Swagger documentation.

## Running it with Docker

This is the easiest way to get the whole thing running, and it is meant to be genuinely one command once Docker is installed. From the root of the repo, with a `.env` file present (copy `.env.template` and fill in a password and a JWT secret), run:

```
docker compose up --build
```

That builds and starts three containers: the MySQL database, the Express server, and the React client served as a static build. The database container loads the schema and seed data automatically on its very first run, so you do not need to do anything else to get some real data to look at. Once everything is up, the client is reachable on port 5173 and the server on port 5000.

## Running it locally without Docker

If you would rather run things directly on your machine, you need a MySQL server available and the schema loaded from `database/asset_management.sql`. Then in `server`, run `npm install` followed by `npm run dev`, which uses `tsx` to run the TypeScript server directly with automatic restarts on changes. In `client`, run `npm install` followed by `npm run dev` to start the Vite dev server.

The server also has a `npm run build` script, which compiles the TypeScript into a `dist` folder, and `npm start`, which runs that compiled output directly with plain Node. That second path is what Docker actually uses in production, since a real compile step is simpler and more predictable than running TypeScript on the fly inside a container.

## The database

The schema covers users, assets, categories with their own custom fields per category (so a laptop category might track RAM and storage while a chair category tracks whether it has a headrest), departments, asset assignments, asset history as a kind of audit trail, and the whole request and approval workflow. It also handles uploaded documents like receipts and repair records, stored on disk with just a reference to the file kept in the database.

## API documentation

The server exposes a Swagger UI at `/api-docs` once it is running, generated from a set of YAML files under `server/swagger`. It is a decent way to see every endpoint, what it expects, and what it returns without having to read through the controller code directly.

## A couple of things worth knowing

The frontend currently has a hardcoded address it uses to reach the backend, which means if you are running this on a different machine or network than the one it was set up on, you may need to adjust that before things will actually connect. This is a known rough edge, not a hidden trap.

Also, the SQL dump in `database` contains real accounts with real password hashes from whoever has used this internally, not synthetic placeholder data. Worth keeping in mind if this repository ever becomes more widely shared.
