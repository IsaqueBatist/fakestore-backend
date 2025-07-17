import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"

describe('People - Create', () => {
  
  it('Create register', async () => {

    const createProduct = await testServer.post('/products').send({name: 'Notebook'})
    expect(createProduct.statusCode).toEqual(StatusCodes.CREATED)
    expect(typeof createProduct.body).toEqual('number')
    
    const createPerson = await testServer.post('/people').send({
      firstName: "Lucas",
      lastName: "Silva",
      email: "teste@exemple.com",
      productId: createProduct.body
    }
)
    expect(createPerson.statusCode).toEqual(StatusCodes.CREATED)
    expect(typeof createPerson.body).toEqual('number')
  })
  it('Try to create a person with a short firstName', async () => {
    const res1 = await testServer.post('/people').send({
      firstName: "Lu",
      lastName: "Silva",
      email: "lucas.silva@example.com",
      productId: 1
    })
    expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
    expect(res1.body).toHaveProperty('errors.body.firstName')
  })
  it('Try to create a person with a short lastName', async () => {
    const res1 = await testServer.post('/people').send({
      firstName: "Lucas",
      lastName: "Si",
      email: "lucas.silva@example.com",
      productId: 1
    })
    expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
    expect(res1.body).toHaveProperty('errors.body.lastName')
  })
  it('try to create a person with an invalid email', async () => {
    const res1 = await testServer.post('/people').send({
      firstName: "Lucas",
      lastName: "Si",
      email: "lucas.silvagmail.com",
      productId: 1
    })
    expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
    expect(res1.body).toHaveProperty('errors.body.email')
  })
})
