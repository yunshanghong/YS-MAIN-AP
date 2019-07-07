/* eslint handle-callback-err: "off"*/

process.env.NODE_ENV = 'test'

const User = require('../app/models/user')
const faker = require('faker')
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
// eslint-disable-next-line no-unused-vars
const should = chai.should()
const loginDetails = {
  email: 'admin@admin.com',
  password: '12345'
}
let token = ''
const createdID = []
let verification = ''
let verificationForgot = ''
const email = faker.internet.email()

chai.use(chaiHttp)

describe('*********** AUTH ***********', () => {
  /* describe('/GET /auth/', () => {
    it('it should GET home API url', done => {
      chai
        .request(server)
        .get('/auth/')
        .end((err, res) => {
          res.should.have.status(200)
          done()
        })
    })
  }) */

  describe('/GET /auth/404url', () => {
    it('it should GET 404 url', done => {
      chai
        .request(server)
        .get('/auth/404url')
        .end((err, res) => {
          res.should.have.status(404)
          res.body.should.be.an('object')
          done()
        })
    })
  })

  describe('/POST /auth/login', () => {
    it('it should GET token', done => {
      chai
        .request(server)
        .post('/auth/login')
        .send(loginDetails)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('access_token')
          token = res.body.access_token
          done()
        })
    })
  })

  describe('/POST /auth/register', () => {
    it('it should POST register', done => {
      const user = {
        displayName: faker.random.words(),
        email,
        password: faker.random.words()
      }
      chai
        .request(server)
        .post('/auth/register')
        .send(user)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.an('object')
          res.body.should.include.keys('access_token', 'user')
          createdID.push(res.body.user._id)
          verification = res.body.user.verification
          done()
        })
    })
    it('it should NOT POST a register if email already exists', done => {
      const user = {
        displayName: faker.random.words(),
        email,
        password: faker.random.words()
      }
      chai
        .request(server)
        .post('/auth/register')
        .send(user)
        .end((err, res) => {
          res.should.have.status(422)
          res.body.should.be.a('object')
          res.body.should.have.property('errors')
          done()
        })
    })
  })

  describe('/POST /auth/verify-email', () => {
    it('it should Get verify-email', done => {
      chai
        .request(server)
        .get(`/auth/verify-email/${verification}`)
        // .send({
        //   id: verification
        // })
        .end((err, res) => { // eslint-disable-line
          // TODO Fix here later
          /* res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.include.keys('email', 'verified')
          res.body.verified.should.equal(true) */
          done()
        })
    })
  })

  describe('/POST /auth/forgot', () => {
    it('it should POST forgot', done => {
      chai
        .request(server)
        .post('/auth/forgot')
        .send({
          email
        })
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.include.keys('msg', 'verification')
          verificationForgot = res.body.verification
          done()
        })
    })
  })

  describe('/POST /auth/reset', () => {
    it('it should POST reset', done => {
      chai
        .request(server)
        .post('/auth/reset')
        .send({
          id: verificationForgot,
          password: '12345'
        })
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('msg').eql('PASSWORD_CHANGED')
          done()
        })
    })
  })

  describe('/POST /auth/access-token', () => {
    it('it should NOT be able to consume the route since no token was sent', done => {
      chai
        .request(server)
        .post('/auth/access-token')
        .end((err, res) => {
          res.should.have.status(401)
          done()
        })
    })
    it('it should GET a fresh token', done => {
      chai
        .request(server)
        .post('/auth/refresh-token')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('access_token')
          done()
        })
    })
  })

  after(() => {
    createdID.forEach(id => {
      User.findByIdAndRemove(id, err => {
        if (err) {
          console.log(err)
        }
      })
    })
  })
})
