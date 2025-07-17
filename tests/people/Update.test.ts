
import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"

describe('People - UpdateById', () => {
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
    const newToken = await testServer.post('/login').set('authorization', 'Bearer ' + token!).send({
      email: 'isaque.test@exemple.com',
      password: '1234567'
    })

    token = newToken.body.accessToken

    const createdProduct = await testServer.post('/products').set('authorization', 'Bearer ' + token!).send({
      name: 'Notebook Lenovo'
    })
    productId = createdProduct.body
  })
  it('Shoud update a person', async () => {
    
    const createPerson = await testServer.post('/people').set('authorization', 'Bearer ' + token!).send({
      firstName: "Lucas",
      lastName: "Silva",
      email: "lucas.silva@example.com",
      productId
    })

    expect(createPerson.statusCode).toEqual(StatusCodes.CREATED)
    expect(typeof createPerson.body).toEqual('number')

    const updatres = await testServer.put(`/people/${createPerson.body}`).set('authorization', 'Bearer ' + token!).send({
      firstName: "Gabriela",
      lastName: "Souza",
      email: "gabriela.souza@example.com",
      productId
    })
    expect(updatres.statusCode).toEqual(StatusCodes.NO_CONTENT)
  })
  it('Try to update a product with a short name', async () => {
    const res1 = await testServer.put('/people/1').set('authorization', 'Bearer ' + token!).send({
      firstName: "Lu",
      lastName: "Silva",
      email: "lucas.silva@example.com",
      productId
    })
      expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(res1.body).toHaveProperty('errors.body.firstName')
  })
  it('Try to update a product with a negative id', async () => {
    const res1 = await testServer.put('/people/-1').set('authorization', 'Bearer ' + token!).send({
      firstName: "Enzo",
      lastName: "Ohki",
      email: "enzo.ohki@example.com",
      productId
    })
      expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(res1.body).toHaveProperty('errors.params.id')
  })
  it('Try to update a product with a non-existing people', async () => {
    const res1 = await testServer.put('/people/9999').set('authorization', 'Bearer ' + token!).send({
      firstName: "Enzo",
      lastName: "Ohki",
      email: "enzo.ohki@example.com",
      productId
    })
      expect(res1.statusCode).toEqual(StatusCodes.NOT_FOUND)
      expect(res1.body).toHaveProperty('errors.default')
  })
  
})