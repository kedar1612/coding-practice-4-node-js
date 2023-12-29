const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const intialize = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3002, () => console.log('success'))
  } catch (e) {
    console.log(`Db Error ${e.message}`)
    process.exit(1)
  }
}
intialize()

const convertObject = dbOject => {
  return {
    playerId: dbOject.player_id,
    playerName: dbOject.player_name,
    jerseyNumber: dbOject.jersey_number,
    role: dbOject.role,
  }
}
// get all player in team
app.get('/players/', async (request, response) => {
  const playersQuery = `
        SELECT 
            * 
        FROM 
            cricket_team;`
  const array = await db.all(playersQuery)
  response.send(array.map(i => convertObject(i)))
})
// create player
app.post('/players/', async (request, response) => {
  const details = request.body
  const {playerName, jerseyNumber, role} = details

  const api2 = `
       INSERT INTO 
            cricket_team(player_name,jersey_number,role)
       VALUES(
             '${playerName}',
             ${jerseyNumber},
             '${role}');`
  await db.run(api2)
  response.send('Player Added to Team')
})
// exact player
app.get('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const api3 = `
        SELECT
            * 
        FROM 
            cricket_team
        WHERE 
            player_id = ${playerId};`
  const db3 = await db.get(api3)
  response.send(convertObject(db3))
})
// update player
app.put('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const detail = request.body
  const {playerName, jerseyNumber, role} = detail

  const api4 = `
        UPDATE 
            cricket_team
        SET 
            player_name = '${playerName}',
            jersey_number = ${jerseyNumber},
            role = '${role}'
        WHERE 
            player_id = ${playerId};`
  await db.run(api4)
  response.send('Player Details Updated')
})

// delete player

app.delete('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const api5 = `
     DELETE FROM 
        cricket_team
    WHERE 
        player_id = ${playerId};`
  await db.run(api5)
  response.send('Player Removed')
})
module.exports = app
