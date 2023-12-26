const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let database = null

const initialzierResponse = async () => {
  try {
    database = await open({
      fileName: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server Running')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initialzierResponse()

const convertObjectToRespons = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const gerPlayerQuery = `
    SELECT 
        *
    FROM
        cricket_team
    ;`

  const playersArray = await database.all(gerPlayerQuery)
  response.send(
    playersArray.map(eachPlayer => convertObjectToRespons(eachPlayer)),
  )
})

app.post('/players/', async (request, response) => {
  const playersDetails = request.body
  const {playerName, jerseyNumber, role} = playersDetails
  const addPlayerQuery = `
        INSERT INTO
            cricket_team (player_name,jersey_number,role)
        VALUES(
              '${playerName}',
              ${jerseyNumber},
              '${role}',
        );`
  const dbResponse = await database.run(addPlayerQuery)
  response.send('Player Added to Team')
})

app.get('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
    SELECT
      * 
    FROM
      cricket_team 
    WHERE
      player_id = ${playerId};`
  const player = await database.get(getPlayerQuery)
  response.send(convertObjectToRespons(player))
})

//to update player

app.put('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const playersDetails = request.body
  const {playerName, jerseyNumber, role} = playersDetails

  const updatePlayerDetails = `
      UPDATE 
        cricket_team
      SET
        player_name = "${playerName}",
        jersey_number = ${jerseyNumber},
        role = "${role}",
      WHERE 
        player_id = ${playerId};`
  await database.run(updatePlayerDetails)
  response.send('Player Details Updatated')
})

//delete player
app.delete('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const deleteQuery = `
    DELETE 
    FROM 
      cricket_team
    WHERE 
      player_id = ${playerId};
  `
  await database.run(deleteQuery)
  response.send('Player Removed')
})

module.exports = app
