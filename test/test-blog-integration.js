'use strict'

const faker = require('faker');
const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;

const {runServer, app, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');
const {BlogPost} = require('../models');


//seed data into test db
function seedTestDb(){

}

//create dummy data using faker
function testDataModel(){
    return
    {
        author: {
            firstName: faker.name.firstName,
            lastName: faker.name.lastName
        },
        title: faker.lorem.words,
        content: faker.lorem.paragraph
        created: faker.date.past
    }
}

//tear down test db
function tearDownDb(){

}
