# RSSchool NodeJS websocket task
> Static http server and base task packages. 
> By default WebSocket client tries to connect to the 3000 port.

## Installation
1. Clone/download repo
2. `npm install`

## Usage
**Development**

`npm run start:dev`

* App served @ `http://localhost:8181` with nodemon

**Production**

`npm run start`

* App served @ `http://localhost:8181` without nodemon

---

**All commands**

Command | Description
--- | ---
`npm run start:dev` | App served @ `http://localhost:8181` with nodemon
`npm run start` | App served @ `http://localhost:8181` without nodemon

**Note**: replace `npm` with `yarn` in `package.json` if you use yarn.

## Some rules
1. I added some additional rules to validation. User login and password should be equal or more then 7 symbols.
2. Registered users store in inmemory database. So after registered user disconnected, login and password still store in database, so after new connect user can login with same login and password. But you can't create several online clients with same login and password
3. User can create one or more room. If game with this user started, all rooms, created by him is hiding and show only after game is finished.
4. If player hits already hitted game cell, answer "turn" with same player id is returned 
5. After user disconnected, all rooms, created by him will be deleted, and, if game with this user is started or on "add_ships" stage, another player will be winner