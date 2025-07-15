import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"

describe("Products - getById", () => {
  it('Shoud return a product', async () => {
    const res1 = await testServer.post('/products').send({name: 'Notebook'})
    const resBuscado = await testServer.get(`/products/${res1.body}`)
    
    expect(resBuscado.statusCode).toEqual(StatusCodes.OK)
    expect(resBuscado.body).toHaveProperty('name')
  })
  it('Try to get a product with a negative id', async () => {
    const res1 = await testServer.get('/products/-1')
    expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
    expect(res1.body).toHaveProperty('errors.params.id')
  })
  it('Try to get a non-existing product', async () => {
    const res1 = await testServer.get('/products/9999')

    expect(res1.statusCode).toEqual(StatusCodes.NOT_FOUND)
    expect(res1.body).toHaveProperty('errors.default')
  })
})