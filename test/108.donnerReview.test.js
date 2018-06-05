
'use strict';

// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const jsonSchema = require('chai-json-schema');
const server = require('../server/server');
const fs = require('fs');
const should = chai.should();
const expect = chai.expect();

chai.use(chaiHttp);
chai.use(jsonSchema);

 

var donnerReviewSchema = {
  title: 'Donner Review Schema V1',
  type: 'object',
  required: [
    'liked',
    'description',
    'organizationId',
    'donationResponseId'
  ],
  properties: {
    liked: {
      type: 'boolean',
    },
    description: {
      type: 'string',
    },
    organizationId: {
      type: 'string',
    },
    donationResponseId: {
      type: 'string',
    },

  },
};

var donationResponseSchema = {
  title: 'Donation response schema v1',
  type: 'object',
  required: ['creationDate',
    'amount',
    'alreadyDelivered',
    'isCanceled',
    'donationRequestId',
    'donnerId'],
  properties: {
    creationDate: {
      type: 'string',
    },
    amount: {
      type: 'number',
      minimum: 0,
    },
    alreadyDelivered: {
      type: 'boolean',
    },
    isCanceled: {
      type: 'boolean',
    },
    donationRequestId: {
      type: 'string',
    },
    donnerId: {
      type: 'string',
    },
  },
};
 
describe('donationResponse', (done) => {
  before((done) => {
// runs before all tests in this block
    console.log('Deleting donation response..');
    chai.request(server)
      .delete('/api/donationResponses')
      .end((err, res) => {
        done();
      });
  });
});

 

describe('/POST api/donationResponse ', function() {
  this.timeout(100000);
  it('it should post one donation response', (done) => {
    chai.request(server)
  // recupero el donation request que cree antes
    .get('/api/donationRequests')
    .end((err, respdonation) => {
      // recupero el donador que cree antes
      chai.request(server)
        .get('/api/Donners')
        .end((err, resdonner) => {
          console.log('Llegue a ...');
          console.log(respdonation.body[0]);
          console.log(resdonner.body[0]);
          chai.request(server).post('/api/donationResponses')
            .send({
              creationDate: '2018-04-19',
              amount: 10,
              alreadyDelivered: false,
              isCanceled: false,
              donationRequestId: respdonation.body[0].id,
              donnerId: resdonner.body[0].id,
            })
            .end((err, res) => {
              res.body.should.be.a('object');
              res.body.should.be.jsonSchema(donationResponseSchema);
              res.should.have.status(200);
              done();
            });
        });
    });
  });
});



// Elimino los donners antes de postear
describe('Donner Review', (done) => {
    before((done) => { 
      console.log('Deleting Donners Reviews..');
      chai.request(server)
        .delete('/api/DonnerReviews')
        .end((err, res) => {

          chai.request(server)
          .get('/api/DonnerReviews')
          .end((err, res) => {
            res.body.should.be.a('array');
            console.log("El objeto es.....");
            console.log(res.body[0]);
            for (let i = 0; i < res.body.length; i++)
              res.body[i].should.be.jsonSchema(donnerReviewSchema);
            res.should.have.status(200);
            done();
          });

          done();
        });
    });
});
  
 

 
   
// Elimino los donners antes de postear
describe('Donner Review', (done) => {
  before((done) => {
// runs before all tests in this block
    console.log('Deleting Donners Reviews..');
    chai.request(server)
      .delete('/api/DonnerReviews')
      .end((err, res) => {
        done();
      });
  });
});

 
// Posteo un donner con una organizacion invalida y sin donnation response id
describe('/POST api/DonnerReviews ', function() {
  this.timeout(100000);
  it('Posteo un Donner con una organizacion invalida ya que es un parametro', (done) => { 
    chai.request(server)
    .get('/api/DonationResponses')
    .end((err, respuesta) => {
            chai.request(server).post('/api/DonnerReviews')
              .send({
                liked: true,  
              })
              .end((err, res) => {
                res.body.should.be.a('object');
                res.should.have.status(400);
                done();
              });  
            });
  });

  it('Posteo un dooner correcto', (done) => {
    chai.request(server)
      .get('/api/Organizations')
      .end((err, res) => {
        chai.request(server)
          .get('/api/DonationResponses')
          .end((err, respuesta) => {
            console.log('Llegue a ...');
            console.log(res.body[0]);
            chai.request(server).post('/api/DonnerReviews')
              .send({
                liked: true,
                description: 'Hola esto es una descripcion',
                organizationId: res.body[0].id,
                donationResponseId: respuesta.body[0].id,
              })
              .end((err, res) => {
                res.body.should.be.a('object');
                res.body.should.be.jsonSchema(donnerReviewSchema);
                res.should.have.status(200);
                done();
              });

          });
      });
  });

  it('Posteo un Donner con una organizacion invalida sin descripcion', (done) => { 
    chai.request(server)
    .get('/api/DonationResponses')
    .end((err, respuesta) => {
            chai.request(server).post('/api/DonnerReviews')
              .send({
                liked: true,
                description: 'Hola esto es una descripcion',
                organizationId: "asdsadasdsasa",
                donationResponseId: respuesta.body[1].id,
              })
              .end((err, res) => {
                res.body.should.be.a('object');
                res.should.have.status(404);
                done();
              });  
            });
  });

  it('Posteo un Donner con una organizacion invalida', (done) => { 
    chai.request(server)
    .get('/api/DonationResponses')
    .end((err, respuesta) => {
            chai.request(server).post('/api/DonnerReviews')
              .send({
                liked: true,
                organizationId: "asdsadasdsasa",
                donationResponseId: respuesta.body[1].id,
              })
              .end((err, res) => {
                res.body.should.be.a('object');
                res.should.have.status(404);
                done();
              });  
            });
  });

  it('Posteo un Donner con mas parametros', (done) => { 
    chai.request(server)
    .get('/api/DonationResponses')
    .end((err, respuesta) => {
            chai.request(server).post('/api/DonnerReviews')
              .send({
                liked: true,  
                a:true,
                c:true,
                d:true,
                e:true,
                f:true,
                g:true,
              })
              .end((err, res) => {
                res.body.should.be.a('object');
                res.should.have.status(400);
                done();
              });  
            });
  }); 

  it('Posteo un Donner con una organizacion con dos parametros requeridos de muchos', (done) => { 
    chai.request(server)
    .get('/api/DonationResponses')
    .end((err, respuesta) => {
            chai.request(server).post('/api/DonnerReviews')
              .send({
                liked: true, 
                organizationId: "asdsadasdsasa", 
              })
              .end((err, res) => {
                res.body.should.be.a('object');
                res.should.have.status(404);
                done();
              });  
            });
  });

  it('Posteo un Donner sin parametros', (done) => { 
    chai.request(server)
    .get('/api/DonationResponses')
    .end((err, respuesta) => {
            chai.request(server).post('/api/DonnerReviews')
              .send({  
              })
              .end((err, res) => {
                res.body.should.be.a('object');
                res.should.have.status(400);
                done();
              });  
            });
      });


  it('Post de una donner con una donación invalida', (done) => {     
    chai.request(server).post('/api/DonnerReviews')
      .send({
        liked: true,
        description: 'Hola esto es una descripcion',
        organizationId: "5b047d9183a96147ab6c77ca",
        donationResponseId: "1234",
      })
      .end((err, res) => {
        res.body.should.be.a('object');
        res.should.have.status(404);
        done();
      });  
    });    

});
 
 

//  Elimino los donners antes de postear
describe('Donner Review', (done) => {
  before((done) => { 
    console.log('Deleting Donners Reviews..');
    chai.request(server)
      .delete('/api/DonnerReviews')
      .end((err, res) => {
        done();
      });
  });
});

 

// Borro los donner
describe('Donner Review', (done) => {
  before((done) => { 
    console.log('Deleting Donners Reviews..');
    chai.request(server)
      .delete('/api/DonnerReviews')
      .end((err, res) => {
        done();
      });
  });
});

// Posteo una donner calificada
describe('/POST api/DonnerReviews ', function() {
  this.timeout(100000);
  it('Post donnerReview con donnation response calificada', (done) => {
    chai.request(server)
      .get('/api/Organizations')
      .end((err, res) => {
        chai.request(server)
          .get('/api/DonationResponses')
          .end((err, respuesta) => {
            console.log('Llegue a ...');
            console.log(res.body[0]);
            chai.request(server).post('/api/DonnerReviews')
              .send({
                liked: true,
                description: 'Hola esto es una descripcion',
                organizationId: res.body[0].id,
                donationResponseId: respuesta.body[1].id,
              })
              .end((err, res) => {
                res.body.should.be.a('object');
                res.should.have.status(404);
                done();
              });

          });
      });
  });
});
   

describe('/GET api/DonnerReviews ', function() {
    this.timeout(100000);
    it('it should get all Donner Reviews', (done) => {
      chai.request(server)
        .get('/api/DonnerReviews')
        .end((err, res) => {
          res.body.should.be.a('array');
          console.log("El objeto es.....");
          console.log(res.body[0]);
          for (let i = 0; i < res.body.length; i++)
            res.body[i].should.be.jsonSchema(donnerReviewSchema);
          res.should.have.status(200);
          done();
        });
    });
  });


  