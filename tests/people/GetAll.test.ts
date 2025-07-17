import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"

describe('People - getAll', () => {
  let token: string | undefined = undefined
  let productId: number | undefined = undefined
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

    const createdProduct = await testServer.post('/products').set('authorization', 'Bearer ' + token!).send({
      name: 'Notebook Lenovo'
    })
    productId = createdProduct.body
  })
  it('Shoud get all people', async () => {
    const createPerson = await testServer.post('/people').set('authorization', 'Bearer ' + token!).send({
      firstName: "Lucas",
      lastName: "Silva",
      email: "lucas.silva@example.com",
      productId
    })
    expect(createPerson.statusCode).toEqual(StatusCodes.CREATED)
    expect(typeof createPerson.body).toEqual('number')

    const res1 = await testServer.get('/people').set('authorization', 'Bearer ' + token!).send()
    
    expect(Number(res1.headers['x-total-count'])).toBeGreaterThan(0)
    expect(res1.statusCode).toEqual(StatusCodes.OK)
    expect(Number(res1.body.length)).toBeGreaterThan(0)
  })
  it('Try to get all people with a negative page', async () => {
    const res1 = await testServer.get('/people?page=-1').set('authorization', 'Bearer ' + token!).send()

    expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
    expect(res1.body).toHaveProperty('errors.query.page')
  })
  it('Try to get all people with a negative limit', async () => {
    const res1 = await testServer.get('/people?limit=-1').set('authorization', 'Bearer ' + token!).send()

    expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
    expect(res1.body).toHaveProperty('errors.query.limit')
  })
})