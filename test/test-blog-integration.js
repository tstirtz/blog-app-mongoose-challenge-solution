const faker = require('faker');
const mongoose = require('mongoose');

const {runServer, app, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');
const {BlogPost} = require('../models');
