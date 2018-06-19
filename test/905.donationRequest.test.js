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

var DonationRequestSchema = {
  title: 'Donation request schema v1',
  type: 'object',
  required: ['creationDate',
    'amount',
    'expirationDate',
    'isPermanent',
    'covered',
    'promised',
    'isOpen',
    'description',
    'productId',
    'organizationId',
  ],
  properties: {
    creationDate: {
      type: 'string',
    },
    amount: {
      type: 'number',
      minimum: 0,
    },
    expirationDate: {
      type: 'string',
    },
    isPermanent: {
      type: 'boolean',
    },
    covered: {
      type: 'number',
      minimum: 0,
    },
    promised: {
      type: 'number',
      minimum: 0,
    },
    isOpen: {
      type: 'boolean',
    },
    description: {
      type: 'string',
    },
    productId: {
      type: 'string',
    },
    organizationId: {
      type: 'string',
    },
  },
};

var DonationRequestSchema2 = {
  title: 'Donation request schema v1',
  type: 'object',
  required: ['creationDate',
    'amount',
    'expirationDate',
    'isPermanent',
    'covered',
    'promised',
    'isOpen',
    'description',
    'productId',
    'organizationId',
  ],
  properties: {
    creationDate: {
      type: 'string',
    },
    amount: {
      type: 'null',
    },

    expirationDate: {
      type: 'string',
    },
    isPermanent: {
      type: 'boolean',
    },
    covered: {
      type: 'number',
      minimum: 0,
    },
    promised: {
      type: 'null',
    },
    isOpen: {
      type: 'boolean',
    },
    description: {
      type: 'string',
    },
    productId: {
      type: 'string',
    },
    organizationId: {
      type: 'string',
    },
  },
};

// esto se ejecuta primero de todo
describe('DonationRequest', (done) => {
  before((done) => {
    chai.request(server)
      .delete('/api/DonationRequests')
      .end((err, res) => {
        console.log('Deleting Donation Requests..');
        done();
      });
  });

  // --------- TESTS DE POST --------- //
  describe('/POST api/DonationRequest ', function() {
    this.timeout(100000);

    // POST EXITOSO
    it('it should post one donation requests', (done) => {
      chai.request(server)
        // recupero un producto
        .get('/api/Products')
        .end((err, prod) => {
          // recupero una organizacion
          chai.request(server)
            .get('/api/Organizations')
            .end((err, org) => {
              chai.request(server).post('/api/DonationRequests')
                .send({
                  // no importa que se manda, siempre va a tomar la fecha actual
                  creationDate: '2017-01-12',
                  amount: 10,
                  expirationDate: '2100-04-25',
                  isPermanent: false,
                  covered: 0,
                  promised: 0,
                  isOpen: true,
                  description: 'Leche',
                  productId: prod.body[0].id,
                  organizationId: org.body[0].id,
                })
                .end((err, res) => {
                  res.body.should.be.a('object');
                  res.body.should.be.jsonSchema(DonationRequestSchema);
                  res.should.have.status(200);
                  done();
                });
            });
        });
    });

    // SE POSTEA UN PEDIDO PERMANENTE
    it('it should post one permanent donation requests', (done) => {
      chai.request(server)
        // recupero un producto
        .get('/api/Products')
        .end((err, prod) => {
          // recupero una organizacion
          chai.request(server)
            .get('/api/Organizations')
            .end((err, org) => {
              chai.request(server).post('/api/DonationRequests')
                .send({
                  creationDate: '2017-01-12',
                  amount: 10,
                  expirationDate: '2100-04-25',
                  isPermanent: true,
                  covered: 0,
                  promised: 0,
                  isOpen: true,
                  description: 'Leche',
                  productId: prod.body[0].id,
                  organizationId: org.body[0].id,
                })
                .end((err, res) => {
                  res.body.should.be.a('object');
                  res.body.should.be.jsonSchema(DonationRequestSchema2);
                  res.should.have.status(200);
                  done();
                });
            });
        });
    });

    // SE POSTEA UN PEDIDO CON COVERED > AMOUNT
    it('it should post one donation requests with covered > amount', (done) => {
      chai.request(server)
        // recupero un producto
        .get('/api/Products')
        .end((err, prod) => {
          // recupero una organizacion
          chai.request(server)
            .get('/api/Organizations')
            .end((err, org) => {
              chai.request(server).post('/api/DonationRequests')
                .send({
                  creationDate: '2017-01-12',
                  amount: 10,
                  expirationDate: '2100-04-25',
                  isPermanent: false,
                  covered: 100,
                  promised: 0,
                  isOpen: true,
                  description: 'Leche',
                  productId: prod.body[0].id,
                  organizationId: org.body[0].id,

                })
                .end((err, res) => {
                  res.body.should.be.a('object');
                  res.body.should.be.jsonSchema(DonationRequestSchema);
                  res.should.have.status(200);
                  done();
                });
            });
        });
    });

    // SE POSTEA UN DONATION RESPONSE CON DONATION REQUEST ASOCIADO
    it('it should post one donation response with a valid donation request'
    , (done) => {
      chai.request(server)
        // recupero un donner
        .get('/api/Donners')
        .end((err, don) => {
          // recupero una donner review
          chai.request(server)
            .get('/api/DonnerReviews')
            .end((err, donR) => {
              // recupero los Donation Request que cree antes
              chai.request(server)
                .get('/api/DonationRequests')
                .end((err, donReq) => {
                  chai.request(server).post('/api/DonationResponses')
                    .send({
                      creationDate: '2018-05-21T22:38:19.116Z',
                      amount: 30,
                      alreadyDelivered: false,
                      isCanceled: false,
                      donationRequestId: donReq.body[0].id,
                      donnerId: don.body[0].id,
                      donnerReviewId: donR.body[0].id,
                    })
                    .end((err, res) => {
                      res.body.should.be.a('object');
                      res.should.have.status(200);
                      done();
                    });
                });
            });
        });
    });

    // SE POSTEA CON PRODUCTO INEXISTENTE
    it('it should fail adding a new donationrequest: inexistent product'
    , (done) => {
      // recupero una organizacion
      chai.request(server)
        .get('/api/Organizations')
        .end((err, org) => {
          chai.request(server).post('/api/DonationRequests')
            .send({
              // no importa que se manda, siempre va a tomar la fecha actual
              creationDate: '2018-04-12',
              amount: 10,
              expirationDate: '2100-04-25',
              isPermanent: false,
              covered: 0,
              promised: 0,
              isOpen: true,
              description: 'Leche',
              productId: 'asdasd',
              organizationId: org.body[0].id,
            })
            .end((err, res) => {
              res.body.should.be.a('object');
              res.should.have.status(404);
              done();
            });
        });
    });

    // SE POSTEA CON ORGANIZACIÓN INEXISTENTE
    it('it should fail adding a new donationrequest: inexistent organization'
    , (done) => {
      chai.request(server)
        // recupero un producto
        .get('/api/Products')
        .end((err, prod) => {
          chai.request(server).post('/api/DonationRequests')
            .send({
              // no importa que se manda, siempre va a tomar la fecha actual
              creationDate: '2018-04-12',
              amount: 10,
              expirationDate: '2100-04-25',
              isPermanent: false,
              covered: 0,
              promised: 0,
              isOpen: true,
              description: 'Leche',
              productId: prod.body[0].id,
              organizationId: '123123',
            })
            .end((err, res) => {
              res.body.should.be.a('object');
              res.should.have.status(404);
              done();
            });
        });
    });

    // SE POSTEA UN PEDIDO PERMANENTE CON FECHA DE EXPIRACION INVÁLIDA
    it(`it should fail adding a new permanent donationrequest: 
    expiration date must be 30 days greater than creation date`
    , (done) => {
      chai.request(server)
        // recupero un producto
        .get('/api/Products')
        .end((err, prod) => {
          // recupero una organizacion
          chai.request(server)
            .get('/api/Organizations')
            .end((err, org) => {
              chai.request(server).post('/api/DonationRequests')
                .send({
                  // no importa que se manda, siempre va a tomar la fecha actual
                  creationDate: '2018-04-12',
                  amount: 10,
                  expirationDate: '2018-04-12',
                  isPermanent: true,
                  covered: 0,
                  promised: 0,
                  isOpen: true,
                  description: 'Leche',
                  productId: prod.body[0].id,
                  organizationId: org.body[0].id,
                })
                .end((err, res) => {
                  res.body.should.be.a('object');
                  res.should.have.status(400);
                  done();
                });
            });
        });
    });

    // SE POSTEA UN PEDIDO CON CANTIDAD = 0
    it(`it should fail adding a new onetime donationrequest: 
      amount cannot be less than 0`
    , (done) => {
      chai.request(server)
        // recupero un producto
        .get('/api/Products')
        .end((err, prod) => {
          // recupero una organizacion
          chai.request(server)
            .get('/api/Organizations')
            .end((err, org) => {
              chai.request(server).post('/api/DonationRequests')
                .send({
                  // no importa que se manda, siempre va a tomar la fecha actual
                  creationDate: '2018-04-12',
                  amount: 0,
                  expirationDate: '2100-04-25',
                  isPermanent: false,
                  covered: 0,
                  promised: 0,
                  isOpen: true,
                  description: 'Leche',
                  productId: prod.body[0].id,
                  organizationId: org.body[0].id,
                })
                .end((err, res) => {
                  res.body.should.be.a('object');
                  res.should.have.status(400);
                  done();
                });
            });
        });
    });

    // SE POSTEA UN PEDIDO CON FECHA MENOR A 2 DIAS
    it(`it should fail adding a new onetime donationrequest: 
      expiration date must be 2 days greater than creation date`
    , (done) => {
      chai.request(server)
        // recupero un producto
        .get('/api/Products')
        .end((err, prod) => {
          // recupero una organizacion
          chai.request(server)
            .get('/api/Organizations')
            .end((err, org) => {
              chai.request(server).post('/api/DonationRequests')
                .send({
                  // no importa que se manda, siempre va a tomar la fecha actual
                  creationDate: '2018-04-12',
                  amount: 10,
                  expirationDate: '2018-04-13',
                  isPermanent: false,
                  covered: 0,
                  promised: 0,
                  isOpen: true,
                  description: 'Leche',
                  productId: prod.body[0].id,
                  organizationId: org.body[0].id,
                })
                .end((err, res) => {
                  res.body.should.be.a('object');
                  res.should.have.status(400);
                  done();
                });
            });
        });
    });

    // SE TRATA DE POSTEAR SIN ATRIBUTOS EN EL BODY
    it('it should fail posting one donation request: no atributes defined'
    , (done) => {
      chai.request(server)
        .get('/api/DonationRequests')
        .end((err, donReq) => {
          chai.request(server).post('/api/DonationRequests')
            .send({

            })
            .end((err, res) => {
              res.body.should.be.a('object');
              res.should.have.status(400);
              done();
            });
        });
    });

    // SE TRATA DE POSTEAR CON ATRIBUTOS INESPERADOS
    it('it should fail posting one donation request: unexpected atributes'
    , (done) => {
      chai.request(server)
        // recupero un producto
        .get('/api/Products')
        .end((err, prod) => {
          // recupero una organizacion
          chai.request(server)
            .get('/api/Organizations')
            .end((err, org) => {
              chai.request(server)
                .get('/api/DonationRequests')
                .end((err, donReq) => {
                  chai.request(server).post(
                  '/api/DonationRequests/' + donReq.body[0].id)
                    .send({
                      creationDate: '2017-01-12',
                      amount: 10,
                      expirationDate: '2100-04-25',
                      isPermanent: false,
                      covered: 0,
                      promised: 0,
                      isOpen: true,
                      description: 'Leche',
                      productId: prod.body[0].id,
                      organizationId: org.body[0].id,
                      a: 'hola',
                      b: '123',
                      c: true,
                      d: 'hola',
                      f: 'hola',
                      g: 'hola',
                      h: 'hola',
                    })
                    .end((err, res) => {
                      res.body.should.be.a('object');
                      res.should.have.status(400);
                      done();
                    });
                });
            });
        });
    });
  });

  // --------- TESTS DE PATCH --------- //
  describe('/PATCH api/DonationRequest ', function() {
    this.timeout(100000);

    // SE PATCHEA UN DONATION REQUEST CON FECHA DE EXPIRACION VALIDA
    it('it should patch one donation request', (done) => {
      // recupero los Donation Request que cree antes
      chai.request(server)
        .get('/api/DonationRequests')
        .end((err, donReq) => {
          chai.request(server).patch(
          '/api/DonationRequests/' + donReq.body[0].id)
            .send({
              // no importa que se manda, siempre va a tomar la fecha actual
              creationDate: '2018-04-12',
              amount: 10,
              expirationDate: '2018-09-25',
              isPermanent: false,
              covered: 0,
              promised: 0,
              isOpen: true,
              description: 'Leche',
              productId: '5b02f7694fa6800b14a094c0',
              organizationId: '5b02f7694fa6800b14a094c1',
            })
            .end((err, res) => {
              res.body.should.be.a('object');
              res.should.have.status(200);
              done();
            });
        });
    });

    // SE PATCHEA UN DONATION REQUEST CON FECHA DE EXPIRACION INVALIDA
    it(`it should fail patching one donation request: 
      expiration date must be 2 days greater than creation date`
    , (done) => {
      // recupero los Donation Request que cree antes
      chai.request(server)
        .get('/api/DonationRequests')
        .end((err, donReq) => {
          chai.request(server).patch(
          '/api/DonationRequests/' + donReq.body[0].id)
            .send({
              // no importa que se manda, siempre va a tomar la fecha actual
              creationDate: '2018-04-12',
              amount: 10,
              expirationDate: '2018-04-13',
              isPermanent: false,
              covered: 0,
              promised: 0,
              isOpen: true,
              description: 'Leche',
              productId: '5b02f7694fa6800b14a094c0',
              organizationId: '5b02f7694fa6800b14a094c1',
            })
            .end((err, res) => {
              res.body.should.be.a('object');
              res.should.have.status(400);
              done();
            });
        });
    });

    // SE PATCHEA UN DONATION REQUEST PERMANENTE CON FECHA DE EXPIRACION VALIDA
    it('it should patch one permanent donation request', (done) => {
      // recupero los Donation Request que cree antes
      chai.request(server)
        .get('/api/DonationRequests')
        .end((err, donReq) => {
          chai.request(server).patch(
          '/api/DonationRequests/' + donReq.body[1].id)
            .send({
              // no importa que se manda, siempre va a tomar la fecha actual
              creationDate: '2018-04-12',
              amount: 10,
              expirationDate: '2018-09-25',
              isPermanent: true,
              covered: 0,
              promised: 0,
              isOpen: true,
              description: 'Leche',
              productId: '5b02f7694fa6800b14a094c0',
              organizationId: '5b02f7694fa6800b14a094c1',
            })
            .end((err, res) => {
              res.body.should.be.a('object');
              res.should.have.status(200);
              done();
            });
        });
    });

    // SE PATCHEA UN DONATION REQUEST PERMANENTE CON FECHA DE EXPIRACION INVALIDA
    it(`it should fail patching one permanent donation request: 
      expiration date must be 30 days greater than creation date`
    , (done) => {
      // recupero los Donation Request que cree antes
      chai.request(server)
        .get('/api/DonationRequests')
        .end((err, donReq) => {
          chai.request(server).patch(
          '/api/DonationRequests/' + donReq.body[1].id)
            .send({
              // no importa que se manda, siempre va a tomar la fecha actual
              creationDate: '2018-04-12',
              amount: 10,
              expirationDate: '2018-05-25',
              isPermanent: true,
              covered: 0,
              promised: 0,
              isOpen: true,
              description: 'Leche',
              productId: '5b02f7694fa6800b14a094c0',
              organizationId: '5b02f7694fa6800b14a094c1',
            })
            .end((err, res) => {
              res.body.should.be.a('object');
              res.should.have.status(400);
              done();
            });
        });
    });

    // SE PATCHEA UN DONATION REQUEST CON AMOUNT < COVERED
    it('it should not patch pedido with amount < covered', (done) => {
      // recupero los Donation Request que cree antes
      chai.request(server)
        .get('/api/DonationRequests')
        .end((err, donReq) => {
          chai.request(server).patch(
          '/api/DonationRequests/' + donReq.body[2].id)
            .send({
              creationDate: '2018-05-21T18:38:30.812Z',
              amount: 10,
              expirationDate: '2018-09-25',
              isPermanent: false,
              description: 'string',
              covered: 500,
              promised: 0,
              isOpen: true,
              organizationId: '5b02f7694fa6800b14a094c1',
              productId: '5b02f7694fa6800b14a094c0',
            })
            .end((err, res) => {
              res.body.should.be.a('object');
              res.should.have.status(400);
              done();
            });
        });
    });

    // SE TRATA DE PATCHEAR SIN ATRIBUTOS EN EL BODY
    it('it should fail patching one donation request: bad request', (done) => {
      chai.request(server)
        .get('/api/DonationRequests')
        .end((err, donReq) => {
          chai.request(server).patch(
          '/api/DonationRequests/' + donReq.body[0].id)
            .send({

            })
            .end((err, res) => {
              res.body.should.be.a('object');
              res.should.have.status(400);
              done();
            });
        });
    });

    // SE TRATA DE PATCHEAR CON ATRIBUTOS INESPERADOS
    it('it should fail patching one donation request: unexpected atributes'
    , (done) => {
      chai.request(server)
        .get('/api/DonationRequests')
        .end((err, donReq) => {
          chai.request(server).patch(
          '/api/DonationRequests/' + donReq.body[0].id)
            .send({
              creationDate: '2017-01-12',
              amount: 10,
              expirationDate: '2100-04-25',
              isPermanent: false,
              covered: 0,
              promised: 0,
              isOpen: true,
              description: 'Leche',
              productId: '5b02f7694fa6800b14a094c0',
              organizationId: '5b02f7694fa6800b14a094c1',
              a: 'hola',
              b: '123',
              c: true,
              d: 'hola',
              f: 'hola',
              g: 'hola',
              h: 'hola',
            })
            .end((err, res) => {
              res.body.should.be.a('object');
              res.should.have.status(400);
              done();
            });
        });
    });
  });

  // --------- TESTS DE DELETE --------- //
  describe('/DELETE api/DonationRequest ', function() {
    this.timeout(100000);

    // DELETE DONATION REQUEST CON ID VALIDO
    it('it should delete one donation request', (done) => {
      // recupero los Donation Request que cree antes
      chai.request(server)
        .get('/api/DonationRequests')
        .end((err, donReq) => {
          chai.request(server).delete(
          '/api/DonationRequests/' + donReq.body[1].id)
            .send({})
            .end((err, res) => {
              res.body.should.be.a('object');
              res.should.have.status(200);
              done();
            });
        });
    });

    // DELETE DONATION REQUEST CON ID INVALIDO
    it('it should fail delete donation request: could not find donation request'
    , (done) => {
      chai.request(server).delete('/api/DonationRequests/000')
        .send({})
        .end((err, res) => {
          res.body.should.be.a('object');
          res.should.have.status(404);
          done();
        });
    });

    // DELETE DONATION REQUEST CON UN DONATION RESPONSE
    it(`it should fail delete donation request: 
      donnation request has a donation response`
    , (done) => {
      chai.request(server)
        .get('/api/DonationRequests')
        .end((err, donReq) => {
          chai.request(server).delete(
          '/api/DonationRequests/' + donReq.body[0].id)
            .send({})
            .end((err, res) => {
              res.body.should.be.a('object');
              res.should.have.status(400);
              done();
            });
        });
    });
  });

  // --------- TESTS DE CLOSE REQUEST --------- //
  describe('/POST api/DonationRequest ', function() {
    this.timeout(100000);

    // CLOSE REQUEST VALIDO
    it('it should close request', (done) => {
      // recupero los Donation Request que cree antes
      chai.request(server)
        .get('/api/DonationRequests')
        .end((err, donReq) => {
          chai.request(server).post(
          '/api/DonationRequests/' + donReq.body[0].id + '/closeRequest')
            .send({
              undefined: { },
            })
            .end((err, res) => {
              res.body.should.be.a('object');
              res.should.have.status(200);
              done();
            });
        });
    });

    // CLOSE REQUEST INVALIDO
    it('it should fail closeRequest: invalid donation request ID', (done) => {
      // recupero los Donation Request que cree antes
      chai.request(server)
        .get('/api/DonationRequests')
        .end((err, donReq) => {
          chai.request(server).post('/api/DonationRequests/123123/closeRequest')
            .send({})
            .end((err, res) => {
              res.body.should.be.a('object');
              res.should.have.status(400);
              done();
            });
        });
    });
  });

  // --------- TESTS DE GET --------- //
  // OBTIENE TODOS
  describe('/GET api/DonationRequests ', function() {
    this.timeout(100000);
    it('it should get all donation requests', (done) => {
      chai.request(server)
        .get('/api/DonationRequests')
        .end((err, res) => {
          res.body.should.be.a('array');
          for (let i = 0; i < res.body.length; i++) {
            if (res.body[i].isPermanent) {
              res.body[i].should.be.jsonSchema(DonationRequestSchema2);
            } else {
              res.body[i].should.be.jsonSchema(DonationRequestSchema);
            }
          }
          res.should.have.status(200);
          done();
        });
    });
  });

  // OBTIENE EXISTENTE
  describe('/GET api/DonationRequests ', function() {
    this.timeout(100000);
    it('it should get one donation requests', (done) => {
      chai.request(server)
        .get('/api/DonationRequests')
        .end((err, res) => {
          chai.request(server).get('/api/DonationRequests/' + res.body[0].id)
            .send({

            })
            .end((err, res) => {
              res.body.should.be.a('object');
              res.body.should.be.jsonSchema(DonationRequestSchema);
              res.should.have.status(200);
              done();
            });
        });
    });
  });

  // OBTIENE INEXISTENTE
  describe('/GET api/DonationRequests ', function() {
    this.timeout(100000);
    it('it should fail getting one donation requests', (done) => {
      chai.request(server).get('/api/DonationRequests/123123')
        .send({})
        .end((err, res) => {
          res.body.should.be.a('object');
          res.should.have.status(400);
          done();
        });
    });
  });
});
