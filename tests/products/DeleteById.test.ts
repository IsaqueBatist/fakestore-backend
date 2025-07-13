import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup"

describe('Products - deleteById', () => {
  it('Should delete a register', async () => {
    const res1 = await testServer.post('/products').send({name: 'Notebook', price: 120})

    expect(res1.statusCode).toEqual(StatusCodes.CREATED)

    const resApagado = await testServer.delete(`/products/${res1.body}`).send();

    expect(resApagado.statusCode).toEqual(StatusCodes.NO_CONTENT)
  })
  it('Try to delete a register without id', async () => {

    const res1 = await testServer.delete('/products/9999')

    expect(res1.statusCode).toEqual(StatusCodes.NOT_FOUND)
    expect(res1.body).toHaveProperty('errors.default')
  })
})