'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jsonSchema = require('chai-json-schema');
const server = require('../server/server');
const fs = require('fs');
const should = chai.should();
const expect = chai.expect;

chai.use(chaiHttp);
chai.use(jsonSchema);

var organizationReviewSchema = {
  title: 'Organization Review Schema V1',
  type: 'object',
  required: [
    'liked',
    'description',
    'donnerId',
    'donationRequestId',
  ],
  properties: {
    liked: {
      type: 'boolean',
    },
    description: {
      type: 'string',
    },
    donnerId: {
      type: 'string',
    },
    donationRequestId: {
      type: 'string',
    },

  },
};

describe('Organization Review extra tests', (done) => {
  before((done) => {
    chai.request(server)
    .delete('/api/OrganizationReviews')
    .end((err, res) => {
      chai.request(server)
      .delete('/api/DonationRequests')
      .end((err, res1) => {
        chai.request(server)
        .delete('/api/Donners')
        .end((err, res2) => {
          chai.request(server)
          .delete('/api/donationResponses')
          .end((err, res3) => {
            done();
          });
        });
      });
    });
  });

  describe('Posting what is needed for OR tests', function() {
    this.timeout(100000);
    it('it should post one Donner', (done) => {
      chai.request(server)
        .get('/api/Cities')
        .end((err, allcities) => {
          chai.request(server)
            .post('/api/Donners')
            .send({
              name: 'Test',
              lastName: 'User',
              phoneNumber: '+549299874563',
              dni: '11222555',
              email: 'test1@user.com',
              username: 'test1@user.com',
              password: '12345',
              reputation: 0,
              cityId: allcities.body[0].id,
            })
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
    });

    it('it should post one donation request', (done) => {
      chai.request(server)
        .get('/api/Products')
        .end((err, resp) => {
          chai.request(server)
            .get('/api/Organizations')
            .end((err, reso) => {
              chai.request(server).post('/api/donationRequests')
                .send({
                  creationDate: '2018-04-12',
                  amount: 10,
                  expirationDate: '2100-04-25',
                  isPermanent: false,
                  covered: 0,
                  promised: 0,
                  isOpen: true,
                  description: 'Leche LargaVida',
                  productId: resp.body[0].id,
                  organizationId: reso.body[0].id,
                })
                .end((err, res) => {
                  res.body.should.be.a('object');
                  res.should.have.status(200);
                  done();
                });
            });
        });
    });

    it('it should post one donation response', (done) => {
      chai.request(server)
        .get('/api/donationRequests')
        .end((err, respdonation) => {
          chai.request(server)
            .get('/api/Donners')
            .end((err, resdonner) => {
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
                  res.should.have.status(200);
                  done();
                });
            });
        });
    });
  });

  describe('/POST api/OrganizationReviews ', function() {
    this.timeout(100000);
    it('it shoul fail adding a new Organization Review: ' +
      'wrong input', (done) => {
      chai.request(server)
      .get('/api/Donners')
      .end((err, resD) => {
        chai.request(server)
        .get('/api/DonationRequests')
        .end((err, resDR) => {
          chai.request(server)
          .post('/api/OrganizationReviews')
          .send({
            liked: 'asd',
            description: '',
            donnerId: resD.body[0].id,
            donationRequestId: resDR.body[0].id,
          })
          .end((err, res) => {
            res.body.should.be.a('object');
            res.should.have.status(400);
            done();
          });
        });
      });
    });

    it('it should fail adding an organization review: ' +
      'repeated item', (done) => {
      chai.request(server)
        .delete('/api/OrganizationReviews')
        .end((err, resD) => {
          chai.request(server)
            .get('/api/Donners')
            .end((err, resGD) => {
              chai.request(server)
                .get('/api/DonationRequests')
                .end((err, resGD1) => {
                  chai.request(server).post('/api/OrganizationReviews')
                    .send({
                      liked: false,
                      description: 'Descripcion del que si postea',
                      donnerId: resGD.body[0].id,
                      donationRequestId: resGD1.body[0].id,
                    })
                    .end((err, resP) => {
                      chai.request(server).post('/api/OrganizationReviews')
                        .send({
                          liked: true,
                          description: 'Descripcion del que falla x repetido',
                          donnerId: resGD.body[0].id,
                          donationRequestId: resGD1.body[0].id,
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

    it('it should fail adding an organization review:' +
      ' incomplete input', (done) => {
      chai.request(server)
        .post('/api/OrganizationReviews')
        .send({
          liked: false,
        })
        .end((err, res) => {
          res.body.should.be.a('object');
          res.should.have.status(400);
          done();
        });
    });

    it('it should fail adding a new organization review: ' +
      'donner not found', (done) => {
      chai.request(server)
        .get('/api/DonationRequests')
        .end((err, respuesta) => {
          chai.request(server).post('/api/OrganizationReviews')
            .send({
              liked: true,
              description: 'Prueba descripcion',
              donnerId: 'asd',
              donationRequestId: respuesta.body[0].id,
            })
            .end((err, res) => {
              res.body.should.be.a('object');
              res.should.have.status(404);
              done();
            });
        });
    });

    it('it should fail adding a new organization review:' +
      ' donation request not found', (done) => {
      chai.request(server)
        .get('/api/Donners')
        .end((err, res) => {
          chai.request(server)
            .post('/api/OrganizationReviews')
            .send({
              liked: true,
              description: 'Hola esto es una descripcion',
              donnerId: res.body[0].id,
              donationRequestId: 'asd',
            })
            .end((err, res) => {
              res.body.should.be.a('object');
              res.should.have.status(404);
              done();
            });
        });
    });

    it('it should fail adding an organization review: empty body', (done) => {
      chai.request(server)
        .delete('/api/OrganizationReviews')
        .end((err, resD) => {
          chai.request(server)
            .get('/api/Donners')
            .end((err, resGD) => {
              chai.request(server)
                .get('/api/DonationRequests')
                .end((err, resGD1) => {
                  chai.request(server).post('/api/OrganizationReviews')
                    .send({
                      donnerId: resGD.body[0].id,
                      donationRequestId: resGD1.body[0].id,
                    })
                    .end((err, resP) => {
                      resP.body.should.be.a('object');
                      resP.should.have.status(400);
                      done();
                    });
                });
            });
        });
    });

    it('it should fail adding an organization review: extra fields', (done) => {
      chai.request(server)
        .delete('/api/OrganizationReviews')
        .end((err, resD) => {
          chai.request(server)
            .get('/api/Donners')
            .end((err, resGD) => {
              chai.request(server)
                .get('/api/DonationRequests')
                .end((err, resGD1) => {
                  chai.request(server).post('/api/OrganizationReviews')
                    .send({
                      donnerId: resGD.body[0].id,
                      donationRequestId: resGD1.body[0].id,
                      otroCampo: 'otrovalor',
                    })
                    .end((err, resP) => {
                      resP.body.should.be.a('object');
                      resP.should.have.status(400);
                      done();
                    });
                });
            });
        });
    });
  });

  describe('/PATCH api/OrganizationReviews ', function() {
    this.timeout(100000);
    // Para este test se requiere que haya al menos 1 elto orgReview cargado
    it('it should patch one Organization Review', (done) => {
      chai.request(server)
        .get('/api/OrganizationReviews')
        .end((err, res) => {
          chai.request(server).patch('/api/OrganizationReviews/' +
            res.body[0].id)
            .send({
              liked: false,
              description: 'Descripcion cambiada por el test',
            })
            .end((err, resPatch) => {
              resPatch.body.should.be.a('object');
              resPatch.body.should.be.jsonSchema(organizationReviewSchema);
              resPatch.should.have.status(200);
              done();
            });
        });
    });

    it('it should fail patching one Organization Review: ' +
      'wrong input', (done) => {
      chai.request(server)
        .get('/api/OrganizationReviews')
        .end((err, res) => {
          chai.request(server).patch('/api/OrganizationReviews/' +
            res.body[0].id)
            .send({
              liked: 'unvalorquenoestrunifols',
              description: '',
            })
            .end((err, resPatch) => {
              resPatch.body.should.be.a('object');
              resPatch.body.should.be.jsonSchema(organizationReviewSchema);
              resPatch.should.have.status(400);
              done();
            });
        });
    });

    it('it should fail patching one Organization Review:' +
      ' OR not found', (done) => {
      chai.request(server).patch('/api/OrganizationReviews/' +
        'asdasdb42equisde1aaReeee')
        .send({
          liked: false,
          description: 'Descripcion cambiada por el test',
        })
        .end((err, resPatch) => {
          resPatch.body.should.be.a('object');
          resPatch.should.have.status(404);
          done();
        });
    });

    it('it should fail patching one Organization Review: ' +
      'extra fields', (done) => {
      chai.request(server)
        .get('/api/OrganizationReviews')
        .end((err, res) => {
          chai.request(server).patch('/api/OrganizationReviews/' +
            res.body[0].id)
            .send({
              donnerId: 'asd',
              donationRequestId: 'asd',
              otroCampoCualqueira: 'unValorCuaqueira',
            })
            .end((err, resPatch) => {
              resPatch.body.should.be.a('object');
              resPatch.should.have.status(400);
              done();
            });
        });
    });

    it('it should fail patching one Organization Review: ' +
      'empty body', (done) => {
      chai.request(server)
        .get('/api/OrganizationReviews')
        .end((err, res) => {
          chai.request(server).patch('/api/OrganizationReviews/' +
            res.body[0].id)
            .send({})
            .end((err, resPatch) => {
              resPatch.body.should.be.a('object');
              resPatch.should.have.status(400);
              done();
            });
        });
    });
  });

  describe('/DELETE api/OrganizationReviews ', function() {
    it('it should remove all Organization Reviews', (done) => {
      chai.request(server)
        .delete('/api/OrganizationReviews')
        .end((err, res) => {
          chai.request(server)
            .get('/api/OrganizationReviews')
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.have.length(0);
              done();
            });
        });
    });
  });
});
