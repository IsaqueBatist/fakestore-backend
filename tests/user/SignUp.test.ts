import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"

describe('User - signUp', () => {
  beforeAll(async () => {
    await testServer.post('/register').send({
      name: 'Isaque repetido',
      email: 'isaque.repetido@gmail.com',
      password_hash: '1234567'
    })
  })
    it('Should register an user', async () => {
        const register = await testServer.post('/register').send({
            name: 'Isaque Test',
            email: 'isaque.test@exemple.com',
            password_hash: '1234567'
        })
        expect(register.statusCode).toEqual(StatusCodes.CREATED)
        expect(typeof register.body).toEqual('number')
    })
    it('Try to register an user with short firstName', async () => {
        const register = await testServer.post('/register').send({
            name: 'Is',
            email: 'isaque.test@exemple.com',
            password_hash: '1234567'
        })
        expect(register.statusCode).toEqual(StatusCodes.BAD_REQUEST)
        expect(register.body).toHaveProperty('errors.body.name')
    })
    it('Try to register an user with an invalid email', async () => {
        const register = await testServer.post('/register').send({
            name: 'Isaque Test',
            email: 'isaque.test',
            password_hash: '1234567'
        })
        expect(register.statusCode).toEqual(StatusCodes.BAD_REQUEST)
        expect(register.body).toHaveProperty('errors.body.email')
    })
    it('Try to register an user with a short password', async () => {
        const register = await testServer.post('/register').send({
            name: 'Isaque Test',
            email: 'isaque.test@gmail.com',
            password: '123'
        })
        expect(register.statusCode).toEqual(StatusCodes.BAD_REQUEST)
        expect(register.body).toHaveProperty('errors.body.password_hash')
    })
    it('Try to register an user with a repeated email', async () => {
        const register = await testServer.post('/register').send({
          name: 'Isaque repetido',
          email: 'isaque.repetido@gmail.com',
          password_hash: '1234567'
        })
        expect(register.statusCode).toEqual(StatusCodes.BAD_REQUEST)
        expect(register.body).toHaveProperty('errors.default')
    })
})