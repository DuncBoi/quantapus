//set up connection to db
const { Pool } = require('pg')
const pool = new Pool({
    host: 'db',
    port: 5432,
    user: 'dunc',
    password: 'bruh',
    database: 'db123'
})

module.exports = pool