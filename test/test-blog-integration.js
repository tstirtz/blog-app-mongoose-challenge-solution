'use strict'

const faker = require('faker');
const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;

const {runServer, app, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');
const {BlogPost} = require('../models');

chai.use(chaiHttp);

//seed data into test db
function seedTestDb(){
    //input 10 items into TEST_DATABASE_URL
    const testData = [];

    for(let i = 1; i <= 10; i++){
        testData.push(testDataModel());
    }
    return BlogPost.insertMany(testData);
}

//create dummy data using faker
function testDataModel(){
    return {
        author: {
            first: faker.name.firstName(),
            last: faker.name.lastName()
        },
        title: faker.lorem.words(),
        content: faker.lorem.paragraph(),
        created: faker.date.past()
    };
}

//tear down test db
function tearDownDb(){
    console.warn("Deleting database");
    return mongoose.connection.dropDatabase();
}

describe('Blog api', function(){
    before(function(){
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function(){
        return seedTestDb();
    });

    afterEach(function(){
        return tearDownDb();
    });

    after(function(){
        closeServer();
    });


    //test GET
    describe('GET endpoint', function(){

        //should return all posts
        it('should return all blog posts', function(){
            //used as foundation for request, it must return a promise or call //done() at the end of the function
            let res;
            return chai.request(app)
                .get('/posts')
                .then(function(_res){
                    res = _res//so that other .then blocks can access the res
                    expect(res).to.have.status(200);//status to be 200
                    expect(res.body).to.have.lengthOf.at.least(1);//expect at least one response
                    return BlogPost.count();
                })
                .then(function(count){
                    expect(res.body).to.have.lengthOf(count);
                });

        });
        //should return posts by id
    });

    //test POST
    describe('POST endpoint', function(){

    });

    //test PUT
    describe('PUT endpoint', function(){

    });

    //test DELETE
    describe('DELETE endpoint', function(){

    });
});
