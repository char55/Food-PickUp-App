'use strict';

require('dotenv').config();

const PORT = process.env.PORT || 8080;
const ENV = process.env.ENV || 'development';
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const sass = require('node-sass-middleware');
const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

const knexConfig = require('./knexfile');
const knex = require('knex')(knexConfig[ENV]);
const morgan = require('morgan');
const knexLogger = require('knex-logger');

// Seperated Routes for each Resource
const orderRoutes = require('./routes/orders');
const indexRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');
const twilioRoutes = require('./routes/twilio');
// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.use(cookieParser());


app.set('view engine', 'ejs');

app.use('/styles', sass({
  src: __dirname + '/styles',
  dest: __dirname + '/public/styles',
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static('public'));

// Mount all resource routes

app.use("/", indexRoutes(knex));
app.use("/orders", orderRoutes(knex));
app.use("/admins", adminRoutes(knex));
app.use("/twilio", twilioRoutes(knex));

app.listen(PORT, () => {
  console.log('Example app listening on port ' + PORT);
});
