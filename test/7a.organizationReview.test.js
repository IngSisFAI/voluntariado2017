
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


var organizationReviewSchema = {
  title: 'Organization Review Schema V1',
  type: 'object',
  required: [
    'liked',
    'description',
    'donnerId',
    'donationRequestId'
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

// esto se ejecuta primero de todo
describe('Organization Review', (done) => {
  before((done) => {
// runs before all tests in this block
    console.log('Deleting Organizations Reviews..');
    chai.request(server)
      .delete('/api/OrganizationReviews')
      .end((err, res) => {
        done();
      });
  });

  describe('/POST api/OrganizationReviews ', function() {
    this.timeout(100000);
    /*Para este post es necesario haber eliminado los elementos orgreview
    cargados para asegurarme de que falle por el motivo propueso*/
    it('it should fail adding a new OrganizationReviews: wrong input', (done) => {
      chai.request(server)
      .get('/api/Donners')
      .end((err,resD) => {
        chai.request(server)
        .get('/api/DonationRequests')
        .end((err, resDR) => {
          chai.request(server)
          .post('/api/OrganizationReviews')
          .send({
            liked: 'asd',
            description: '',
            donnerId:resD.body[0].id,
            donationRequestId: resDR.body[0].id
          })
          .end((err, res) => {
            res.body.should.be.a('object');
            res.should.have.status(404);
            //debería devolver 404 porq descripcion es required y devuelve 200
            done();
          });
        });
      });
    });

    it('it should fail adding a organizationreview: repeted item', (done) => {
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

    /*Los siguientes 2 test retornan el mismo error por diferentes motivos*/
    it('it should fail adding a organizationreview: inexistent donner', (done) =>{
      chai.request(server)
      .post('/api/OrganizationReviews')
      .send({
        liked:false
      })
      .end((err,res) =>{
        res.body.should.be.a('object');
        res.should.have.status(400);
        done();
      });
    });
    it('it should fail adding a new organizationreview: inexistent donner', (done) => {
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

    it('it should fail adding a new organizationreview: inexistent donation request', (done) => {
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

    it('it should fail adding a organizationreview: no input', (done) => {
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
              res.body.should.be.a('object');
              res.should.have.status(400);
              done();
            });
          });
        });
      });
    });

    it('it should fail adding a organizationreview: extra data', (done) => {
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
              otroCampo: 'otrovalor'
            })
            .end((err, resP) => {
              res.body.should.be.a('object');
              res.should.have.status(400);
              done();
            });
          });
        });
      });
    });

  });

  describe('/PATCH api/OrganizationReviews ', function() {
    this.timeout(100000);
    /*Para este test se requiere que haya al menos 1 elto orgReview cargado*/
    it('it should patch one Organization Review', (done) => {
      chai.request(server)
      .get('/api/OrganizationReviews')
      .end((err, res) => {
        chai.request(server).patch('/api/OrganizationReviews/'+res.body[0].id)
        .send({
          liked: false,
          description: 'Descripcion cambiada por el test',
        })
        .end((err, resPatch) =>{
          resPatch.body.should.be.a('object');
          resPatch.body.should.be.jsonSchema(organizationReviewSchema);
          resPatch.should.have.status(200);
          done();
        });
      });
    });

    it('it should fail patching one Organization Review: wrong input', (done) => {
      chai.request(server)
      .get('/api/OrganizationReviews')
      .end((err, res) => {
        chai.request(server).patch('/api/OrganizationReviews/'+res.body[0].id)
        .send({
          liked: 'unvalorquenoestrunifols',
          description: '',
        })
        .end((err, resPatch) =>{
          resPatch.body.should.be.a('object');
          resPatch.body.should.be.jsonSchema(organizationReviewSchema);
          resPatch.should.have.status(400);
          done();
        });
      });
    });

    it('it should fail patching one Organization Review: OR not found', (done) => {
      chai.request(server).patch('/api/OrganizationReviews/'+'asdasdb42equisde1aaReeee')
        .send({
          liked: false,
          description: 'Descripcion cambiada por el test',
        })
        .end((err, resPatch) =>{
          resPatch.body.should.be.a('object');
          resPatch.should.have.status(404);
          done();
        });
    });

    it('it should fail patching one Organization Review: extra data', (done) => {
      chai.request(server)
      .get('/api/OrganizationReviews')
      .end((err, res) => {
        chai.request(server).patch('/api/OrganizationReviews/'+res.body[0].id)
        .send({
          donnerId: 'asd',
          donationRequestId: 'asd',
          otroCampoCualqueira: 'unValorCuaqueira'
        })
        .end((err, resPatch) =>{
          resPatch.body.should.be.a('object');
          resPatch.should.have.status(400);
          done();
        });
      });
    });

    it('it should fail patching one Organization Review: no data', (done) => {
      chai.request(server)
      .get('/api/OrganizationReviews')
      .end((err, res) => {
        chai.request(server).patch('/api/OrganizationReviews/'+res.body[0].id)
        .send({ })
        .end((err, resPatch) =>{
          resPatch.body.should.be.a('object');
          resPatch.should.have.status(400);
          done();
        });
      });
    });

  });

  describe('/DELETE api/OrganizationReviews ', function (){
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
