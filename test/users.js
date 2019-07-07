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
const email = faker.internet.email()
const createdID = []

chai.use(chaiHttp)

describe('*********** USERS ***********', () => {
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
  describe('/GET /api/users', () => {
    it('it should NOT be able to consume the route since no token was sent', done => {
      chai
        .request(server)
        .get('/api/users')
        .end((err, res) => {
          res.should.have.status(401)
          done()
        })
    })
    it('it should GET all the users', done => {
      chai
        .request(server)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.docs.should.be.a('array')
          done()
        })
    })
    it('it should GET the users with filters', done => {
      chai
        .request(server)
        .get('/api/users?filter=admin&fields=name,email,city,country,phone')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.docs.should.be.a('array')
          res.body.docs.should.have.lengthOf(1)
          res.body.docs[0].should.have.property('email').eql('admin@admin.com')
          done()
        })
    })
  })
  describe('/POST user', () => {
    it('it should NOT POST a user without name', done => {
      const user = {}
      chai
        .request(server)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(user)
        .end((err, res) => {
          res.should.have.status(422)
          res.body.should.be.a('object')
          res.body.should.have.property('errors')
          done()
        })
    })
    it('it should POST a user ', done => {
      const user = {
        displayName: faker.random.words(),
        email,
        password: faker.random.words(),
        role: 'admin',
        urlTwitter: faker.internet.url(),
        urlGitHub: faker.internet.url(),
        phone: faker.phone.phoneNumber(),
        city: faker.random.words(),
        country: faker.random.words()
      }
      chai
        .request(server)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(user)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          res.body.should.include.keys(
            '_id',
            'displayName',
            'email',
            'verification'
          )
          createdID.push(res.body._id)
          done()
        })
    })
    it('it should NOT POST a user with email that already exists', done => {
      const user = {
        name: faker.random.words(),
        email,
        password: faker.random.words(),
        role: 'admin'
      }
      chai
        .request(server)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(user)
        .end((err, res) => {
          res.should.have.status(422)
          res.body.should.be.a('object')
          res.body.should.have.property('errors')
          done()
        })
    })
    it('it should NOT POST a user with not known role', done => {
      const user = {
        name: faker.random.words(),
        email,
        password: faker.random.words(),
        role: faker.random.words()
      }
      chai
        .request(server)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(user)
        .end((err, res) => {
          res.should.have.status(422)
          res.body.should.be.a('object')
          res.body.should.have.property('errors')
          done()
        })
    })
  })
  describe('/GET/:id /api/user', () => {
    it('it should GET a user by the given id', done => {
      const id = createdID.slice(-1).pop()
      chai
        .request(server)
        .get(`/api/users/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .end((error, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('displayName')
          res.body.should.have.property('_id').eql(id)
          done()
        })
    })
  })
  describe('/PATCH/:id /api/user', () => {
    it('it should UPDATE a user given the id', done => {
      const id = createdID.slice(-1).pop()
      const user = {
        displayName: 'JS123456',
        email: 'emailthatalreadyexists@email.com',
        role: 'admin',
        urlTwitter: faker.internet.url(),
        urlGitHub: faker.internet.url(),
        phone: faker.phone.phoneNumber(),
        city: faker.random.words(),
        country: faker.random.words()
      }
      chai
        .request(server)
        .patch(`/api/users/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(user)
        .end((error, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('_id').eql(id)
          res.body.should.have.property('displayName').eql('JS123456')
          res.body.should.have
            .property('email')
            .eql('emailthatalreadyexists@email.com')
          createdID.push(res.body._id)
          done()
        })
    })
    it('it should NOT UPDATE a user with email that already exists', done => {
      const id = createdID.slice(-1).pop()
      const user = {
        name: faker.random.words(),
        email: 'admin@admin.com',
        role: 'admin'
      }
      chai
        .request(server)
        .patch(`/api/users/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(user)
        .end((err, res) => {
          res.should.have.status(422)
          res.body.should.be.a('object')
          res.body.should.have.property('errors')
          done()
        })
    })
  })
  describe('/DELETE/:id /api/user', () => {
    it('it should DELETE a user given the id', done => {
      const user = {
        displayName: faker.random.words(),
        email: faker.internet.email(),
        password: faker.random.words(),
        role: 'admin',
        urlTwitter: faker.internet.url(),
        urlGitHub: faker.internet.url(),
        phone: faker.phone.phoneNumber(),
        city: faker.random.words(),
        country: faker.random.words()
      }
      chai
        .request(server)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(user)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          res.body.should.include.keys(
            '_id',
            'displayName',
            'email',
            'verification'
          )
          chai
            .request(server)
            .delete(`/api/users/${res.body._id}`)
            .set('Authorization', `Bearer ${token}`)
            .end((error, result) => {
              result.should.have.status(200)
              result.body.should.be.a('object')
              result.body.should.have.property('msg').eql('DELETED')
              done()
            })
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
