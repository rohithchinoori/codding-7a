const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3002, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    matchId: dbObject.match_name,
    match: dbObject.match,
    year: dbObject.year,
    playerMatchId: dbObject.player_match_id,
    score: dbObject.score,
    fours: dbObject.fours,
    sixes: dbObject.sixes,
  };
};
//API1
app.get("/players/", async (request, response) => {
  const getPlayers = `
    SELECT 
    *
    FROM 
    player_details;
    `;
  const playersArray = await db.all(getPlayers);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//API2
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const query = `
    SELECT *
    FROM 
    player_details
    WHERE 
    player_id=${playerId};
    `;
  const playersArray = await db.get(query);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});
//API3
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const query = `
    UPDATE
     player_details
     SET
     player_name='${playerName}'
     WHERE
     player_id=${playerId};
    `;
  await db.run(query);
  response.send("Player Details Updated");
});
//API4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const query = `
    SELECT 
    *
    FROM
    match_details
    WHERE
    match_id=${matchId};
    `;
  const playersArray = await db.get(query);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});
//API5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const query = `
    SELECT
    *
    FROM
    player_match_score
    NATURAL JOIN
    match_details
    WHERE 
    player_id=${playerId};
    `;
  const playersArray = await db.all(query);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});
//API6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const query = `
    SELECT
    *
    FROM
    player_match_score
    NATURAL JOIN
    player_details
    WHERE 
    match_id=${matchId};
    `;
  const playersArray = await db.all(query);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});
//API7
app.get("/players/:playerId/playerscores", async (request, response) => {
  const { playerId } = request.params;
  const query = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};
    `;
  const playerScore = await db.get(query);
  response.send(playerScore);
});

module.exports = app;
