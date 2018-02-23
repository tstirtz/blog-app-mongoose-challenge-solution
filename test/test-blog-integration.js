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
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName()
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
        it('response should have correct keys', function(){
            //make request for all posts
            //get id of one posts and pass it to another .then block
            //check that post contains all expected keys

            let singlePost;

            return chai.request(app)
                .get('/posts')
                .then(function(res){
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.an('array');

                    res.body.forEach(function(post){
                        expect(post).to.have.all.keys('author', 'title', 'content', 'created', 'id');
                    });


                    singlePost = res.body[0];
                    return BlogPost.findById(singlePost.id);
                })
                .then(function(post){
                    // post = post.serialize();
                    //res id to match singlePost.id
                    expect(post.id).to.equal(singlePost.id);
                    //keys to match
                    expect(post.authorName).to.equal(singlePost.author);
                    //values to match
                    expect(post.title).to.equal(singlePost.title);
                    expect(post.content).to.equal(singlePost.content);
                });

        });
    });

    //test POST
    describe('POST endpoint', function(){

        it('should return new post', function(){
        const testPost = {
            author: {
                firstName: "Test",
                lastName: "Last"
            },
            title: "Test Title",
            content: "Test Content",
        }
        return chai.request(app)
            .post('/posts')
            .send(testPost)
            .then(function(res){
                //status 201
                expect(res).to.have.status(201);
                //res should object
                expect(res).to.be.json;
                //test keys match
                expect(res.body.title).to.equal(testPost.title);
                expect(res.body.content).to.equal(testPost.content);
                expect(res.body.author).to.equal(`${testPost.author.firstName} ${testPost.author.lastName}`);

                return BlogPost.findById(res.body.id);
            })
            .then(function(post){
                //to be object
                expect(post).to.be.an('object');
                expect(post.title).to.equal(testPost.title);
                expect(post.content).to.equal(testPost.content);
                expect(post.author.firstName).to.equal(testPost.author.firstName);
                expect(post.author.lastName).to.equal(testPost.author.lastName);
            });
        });
    });

    //test PUT
    describe('PUT endpoint', function(){
        it('should update an existing post', function(){
            //test data to updated
            const updatePost = {
                title: "New Title",
                content: "New Content"
            };
            return BlogPost
                .findOne()
                .then(function(res){
                    updatePost.id = res.id;

                return chai.request(app)
                    .put(`/posts/${updatePost.id}`)
                    .send(updatePost)
                    .then(function(res){
                        expect(res).to.have.status(204);
                        return BlogPost.findById(updatePost.id);
                    })
                    .then(function(post){
                        expect(post).to.be.an('object');
                        expect(post.title).to.equal(updatePost.title);
                        expect(post.content).to.equal(updatePost.content);
                        expect(post.id).to.equal(updatePost.id);
                    })
                });

        });
    });

    //test DELETE
    describe('DELETE endpoint', function(){
        it('should delete an existing post', function(){
            //deleting a post by an id, so I need to retrieve an ID
            //make DELETE request with retrieved id
                //test status of response
            //make findById call with retrieve id
                //expect response to be null
            let postId;
            return BlogPost
                .findOne()
                .then(function(post){
                    postId = post.id;
                return chai.request(app)
                    .delete(`/posts/${postId}`)
                    .then(function(res){
                        expect(res).to.have.status(204);
                        return BlogPost.findById(postId);
                    })
                    .then(function(post){
                        console.log(post);
                        expect(post).to.be.a('null');
                    });
                });
            });
    });
});
