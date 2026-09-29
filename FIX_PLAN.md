## Pass 1 (Day 1): Docker and config

### Time: 5 Hrs

**Goal:** a fresh clone of our code runs with one command (given the person has Docker installed), and nothing secret or precious lives in the image.

**The problems**

- **The server image can't actually build itself.** The Dockerfile never compiles the TypeScript, and the compiled folder isn't in git. It only works on our machine because our local copy of that folder gets swept into the image. On anyone else's machine the server container would crash on start.
- **Our secrets get baked into the image.** There is no ignore file, so our local `.env` (database password, JWT secret) is copied into the image. Anyone who gets the image gets the secrets.
- **Uploaded files disappear when the container is rebuilt.** The database has a persistent volume and the uploads folder doesn't. The database rows would still point at files that no longer exist.
- **The server may start before the database is ready**, and it logs in as the all powerful `root` user.
- **The database is exposed to the host machine** through a published port that nothing needs.
- **A missing environment variable isn't noticed until it breaks something.** We told TypeScript the values exist, but nothing checks that they do.

**The fixes**

1. Make the server build in two stages. The first stage compiles. The second stage is a clean, small image that holds only the compiled output and production dependencies, and runs as a non-root user.
2. Add an ignore file to both the client and the server, so `.env`, local build folders, `node_modules` and uploads never enter an image.
3. Give the uploads folder a persistent volume, the same way the database has one.
4. Make the server wait until the database reports healthy. Have the app log in as a limited database user instead of `root`, and stop publishing the database port.
5. Check the required environment variables when the server starts. If one is missing, say which one and stop right away.
6. Correct the README, which currently overstates how Docker runs the server, and document the new variables in the template.


---

## Pass 2 (Day 2): Auth and security

### Time: 5ish Hrs

**Goal:** close the holes an outsider could use.

**The problems**

- **Login leaks who has an account.** It checks whether the account is deactivated before it checks the password. Someone with no password can learn which emails are deactivated.
- **Nothing stops password guessing.** There is no limit on login attempts.
- **The server is wide open by default.** No security headers, and any website can call the API from a browser.
- **Some errors show internal details.** A handful of catch blocks send the raw database error text back to the user, which reveals table and column names.
- **The API documentation is public**, which hands attackers a map of every endpoint.
- **After 30 minutes the app looks logged in but nothing works.** The token expires, but the client never notices and just shows the UI, although with errors.
- **Uploaded documents may be readable by the wrong people.** Any logged in user can request a file if they know its address. We haven't confirmed whether the document listing has the same gap.
- **There is no minimum password length.**

**The fixes**

1. Check the password first and the deactivated flag second, and give the same answer for "no such account" and "wrong password".
2. Limit login attempts per IP over a time window.
3. Add standard security headers, and restrict cross-origin access to our own client.
4. Log real errors on the server, and send users a fixed, generic message.
5. Only serve the API documentation outside production.
6. When the client gets an "unauthorized" response, clear the saved login and send the user to the login page. The login request itself is excluded, or a wrong password would trigger it.
7. First find out whether an employee can reach documents for assets that aren't theirs. If they can, limit access to admins and the person the asset is assigned to.
8. Require a sensible minimum password length when passwords are set or changed.

---

## Pass 3 (Day 3): Data integrity

### Time: 6 Hrs

**Goal:** make it impossible to corrupt asset state, even when two people act at the same moment. This is one of the riskier passes.

**The problems**

- **Two admins can assign the same asset at once.** The code checks that the asset is available, and only afterwards starts the transaction that assigns it. In that gap, a second admin passes the same check. Both succeed, and the asset ends up with two active assignments. The same check-then-write pattern shows up in the approve, return and repair flows.
- **One fact is stored in three places.** Who holds an asset is recorded on the asset itself, in its status, and in the assignments table. Nothing in the database stops them from disagreeing.
- **The schema allows states the app never intends.** A request can have no status at all, and a user can have no password hash.
- **Common searches have no indexes to lean on**, which is fine at 25 rows but slow at 25,000.
- **A dead table sits in the schema** and nothing uses it.
- **The server trusts whatever the client sends.** Request bodies aren't checked, so wrong types or missing fields cause confusing errors instead of a clean "bad request". TypeScript doesn't help here, because it can't see what arrives over the network.

**The fixes**

1. Do the checks inside the transaction, and lock the rows being checked so a second admin has to wait and then sees the updated state. Apply the same fix to every flow with that pattern.
2. Write one migration for the schema changes:
   - Make request status and password hash required.
   - Add indexes for the columns we filter and sort by.
   - Add a database rule that an asset can only have one active assignment, so this bug becomes an error instead of silent corruption.
   - Remove the unused table.
   
   Before each change, look for existing data that would violate it.
3. Update the SQL file used to create fresh databases, so new installs match.
4. Add a validation layer on the endpoints that write data, including checking that IDs in the URL are real numbers. Reads can wait.

---

## Pass 4 (Day 4): Performance and cleanup

### Time: 5-ish Hrs

**Goal:** Optimizing data fetches across the DB and the server.
s
**The problems**

- **The employee list runs one extra database query per employee.** Ten employees means eleven queries, and a hundred means a hundred and one.
- **Fetching a single asset waits on up to four database round trips in a row**, one after another, even though most of them don't depend on each other's results, only on the caller's role, which is already known before any of them run.
- **Anyone can ask for a million rows at once.** The page size has no upper limit.
- **The sidebar badge downloads every pending request just to count them**, and it does that on every page change.
- **The same color and label tables are copied into several pages.** Change one and the others quietly disagree.
- **Small honesty problems in the code.** An "asset not available" error is reported as a bad request when it's really a conflict. One middleware has a name that says the opposite of what it does. Old commented-out signup code is still around.
- **The SQL file contains real people's accounts.**

**The fixes**

1. Fetch all departments for the listed employees in one query and match them up in code. We will make use of some data fetching library.
2. Put a sensible ceiling on page size.
3. Add a tiny endpoint that returns only the count, and use it for the badge.
4. Move the shared color and label tables into one file that every page imports.
5. Use the correct "conflict" status for unavailable assets, rename the middleware to say what it really does (accepts expired tokens), and delete the dead signup code.
