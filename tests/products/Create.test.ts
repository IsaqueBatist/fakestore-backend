import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"

describe('Products - Create', () => {
  let token: string | undefined = undefined
  beforeAll(async () => {
    //Create user
    await testServer.post('/register').send({
            firstName: 'Isaque',
            lastName: 'Test',
            email: 'isaque.test@exemple.com',
            password: '1234567'
    })

    //Get token
    const newToken = await testServer.post('/login').send({
      email: 'isaque.test@exemple.com',
      password: '1234567'
    })

    token = newToken.body.accessToken
  })

  it('Create register', async () => {

    const res1 = await testServer.post('/products').set('authorization', 'Bearer ' + token!).send({name: 'Notebook'})

    expect(res1.statusCode).toEqual(StatusCodes.CREATED)
    expect(typeof res1.body).toEqual('number') 
  })
  it('Try to create a register with a short name', async () => {

    const res1 = await testServer.post('/products').set('authorization', 'Bearer ' + token!).send({name: 'Co'})

    expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
    expect(res1.body).toHaveProperty('errors.body.name') 
  })
  it('Try to create a register without name', async () => {

    const res1 = await testServer.post('/products').set('authorization', 'Bearer ' + token!).send({})

    expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
    expect(res1.body).toHaveProperty('errors.body.name') 
  })
})
