import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup"

describe('People - deleteById', () => {
  let productId: number | undefined = undefined
  beforeAll(async () => {
    const createdProduct = await testServer.post('/products').send({
      name: 'Notebook Lenovo'
    })
    productId = createdProduct.body
  })

  it('Should delete a register', async () => {
    const createPerson = await testServer.post('/people').send({
      firstName: "Lucas",
      lastName: "Silva",
      email: "lucas.silva@example.com",
      productId
    })
    expect(createPerson.statusCode).toEqual(StatusCodes.CREATED)
    expect(typeof createPerson.body).toEqual('number')

    const resApagado = await testServer.delete(`/people/${createPerson.body}`).send();

    expect(resApagado.statusCode).toEqual(StatusCodes.NO_CONTENT)
  })
  it('Try to delete a register with an invalid id', async () => {
    const res1 = await testServer.delete('/people/-1')

    expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
    expect(res1.body).toHaveProperty('errors.params.id')
  })
  it('Try to delete a non-existing person', async () => {
    const res1 = await testServer.delete('/people/9999')

    expect(res1.statusCode).toEqual(StatusCodes.NOT_FOUND)
    expect(res1.body).toHaveProperty('errors.default')
  })
})