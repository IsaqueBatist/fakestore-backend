import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"

describe('People - getAll', () => {
  let productId: number | undefined = undefined
  beforeAll(async () => {
    const createdProduct = await testServer.post('/products').send({
      name: 'Notebook Lenovo'
    })
    productId = createdProduct.body
  })
  it('Shoud get all people', async () => {
    const createPerson = await testServer.post('/people').send({
      firstName: "Lucas",
      lastName: "Silva",
      email: "lucas.silva@example.com",
      productId
    })
    expect(createPerson.statusCode).toEqual(StatusCodes.CREATED)
    expect(typeof createPerson.body).toEqual('number')

    const res1 = await testServer.get('/people')
    
    expect(Number(res1.headers['x-total-count'])).toBeGreaterThan(0)
    expect(res1.statusCode).toEqual(StatusCodes.OK)
    expect(Number(res1.body.length)).toBeGreaterThan(0)
  })
  it('Try to get all people with a negative page', async () => {
    const res1 = await testServer.get('/people?page=-1')

    expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
    expect(res1.body).toHaveProperty('errors.query.page')
  })
  it('Try to get all people with a negative limit', async () => {
    const res1 = await testServer.get('/people?limit=-1')

    expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
    expect(res1.body).toHaveProperty('errors.query.limit')
  })
})