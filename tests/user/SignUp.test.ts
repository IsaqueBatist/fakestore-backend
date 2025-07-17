import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"

describe('User - signUp', () => {
    it('Should register an user', async () => {
        const register = await testServer.post('/register').send({
            firstName: 'Isaque',
            lastName: 'Test',
            email: 'isaque.test@exemple.com',
            password: '1234567'
        })
        expect(register.statusCode).toEqual(StatusCodes.CREATED)
        expect(typeof register.body).toEqual('number')
    })
    it('Try to register an user with short firstName', async () => {
        const register = await testServer.post('/register').send({
            firstName: 'Is',
            lastName: 'Test',
            email: 'isaque.test@exemple.com',
            password: '1234567'
        })
        expect(register.statusCode).toEqual(StatusCodes.BAD_REQUEST)
        expect(register.body).toHaveProperty('errors.body.firstName')
    })
    it('Try to register an user with short lastName', async () => {
        const register = await testServer.post('/register').send({
            firstName: 'Isaque',
            lastName: 'Te',
            email: 'isaque.test@exemple.com',
            password: '1234567'
        })
        expect(register.statusCode).toEqual(StatusCodes.BAD_REQUEST)
        expect(register.body).toHaveProperty('errors.body.lastName')
    })
    it('Try to register an user with an invalid email', async () => {
        const register = await testServer.post('/register').send({
            firstName: 'Isaque',
            lastName: 'Te',
            email: 'isaque.test',
            password: '1234567'
        })
        expect(register.statusCode).toEqual(StatusCodes.BAD_REQUEST)
        expect(register.body).toHaveProperty('errors.body.email')
    })
    it('Try to register an user with a short password', async () => {
        const register = await testServer.post('/register').send({
            firstName: 'Isaque',
            lastName: 'Te',
            email: 'isaque.test',
            password: '123'
        })
        expect(register.statusCode).toEqual(StatusCodes.BAD_REQUEST)
        expect(register.body).toHaveProperty('errors.body.password')
    })
})