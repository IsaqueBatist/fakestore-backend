import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"

describe("People - getById", () => {
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

    //Create Product
    const createdProduct = await testServer.post('/products').set('authorization', 'Bearer ' + token!).send({
      name: 'Notebook Lenovo'
    })
    productId = createdProduct.body
  })

  it('Shoud return a product', async () => {
    const createPerson = await testServer.post('/people').set('authorization', 'Bearer ' + token!).send({
      firstName: "Lucas",
      lastName: "Silva",
      email: "lucas.silva@example.com",
      productId
    })
    expect(createPerson.statusCode).toEqual(StatusCodes.CREATED)
    expect(typeof createPerson.body).toEqual('number')

    const resBuscado = await testServer.get(`/people/${createPerson.body}`).set('authorization', 'Bearer ' + token!).send()
    
    expect(resBuscado.statusCode).toEqual(StatusCodes.OK)
    expect(resBuscado.body).toHaveProperty('firstname')
  })
  it('Try to get a product with a negative id', async () => {
    const res1 = await testServer.get('/people/-1').set('authorization', 'Bearer ' + token!).send()
    expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
    expect(res1.body).toHaveProperty('errors.params.id')
  })
  it('Try to get a non-existing product', async () => {
    const res1 = await testServer.get('/people/9999').set('authorization', 'Bearer ' + token!).send()

    expect(res1.statusCode).toEqual(StatusCodes.NOT_FOUND)
    expect(res1.body).toHaveProperty('errors.default')
  })
})