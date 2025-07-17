
import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"

describe('People - UpdateById',() =>{
  let productId: number | undefined = undefined
  
  beforeAll(async () => {
    const createdProduct = await testServer.post('/products').send({
      name: 'Notebook Lenovo'
    })
    productId = createdProduct.body
  })
  it('Shoud update a person', async () => {
    
    const createPerson = await testServer.post('/people').send({
      firstName: "Lucas",
      lastName: "Silva",
      email: "lucas.silva@example.com",
      productId
    })

    expect(createPerson.statusCode).toEqual(StatusCodes.CREATED)
    expect(typeof createPerson.body).toEqual('number')

    const updatres = await testServer.put(`/people/${createPerson.body}`).send({
      firstName: "Gabriela",
      lastName: "Souza",
      email: "gabriela.souza@example.com",
      productId
    })
    expect(updatres.statusCode).toEqual(StatusCodes.NO_CONTENT)
  })
  it('Try to update a product with a short name', async () => {
    const res1 = await testServer.put('/people/1').send({
      firstName: "Lu",
      lastName: "Silva",
      email: "lucas.silva@example.com",
      productId
    })
      expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(res1.body).toHaveProperty('errors.body.firstName')
  })
  it('Try to update a product with a negative id', async () => {
    const res1 = await testServer.put('/people/-1').send({
      firstName: "Enzo",
      lastName: "Ohki",
      email: "enzo.ohki@example.com",
      productId
    })
      expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(res1.body).toHaveProperty('errors.params.id')
  })
  it('Try to update a product with a non-existing people', async () => {
    const res1 = await testServer.put('/people/9999').send({
      firstName: "Enzo",
      lastName: "Ohki",
      email: "enzo.ohki@example.com",
      productId
    })
      expect(res1.statusCode).toEqual(StatusCodes.NOT_FOUND)
      expect(res1.body).toHaveProperty('errors.default')
  })
  
})