import { StatusCodes } from "http-status-codes";
import { testServer } from "../jest.setup"

describe('Products - deleteById', () => {
  it('Should delete a register', async () => {
    const res1 = await testServer.post('/products').send({ name: 'Notebook' })
    expect(res1.statusCode).toEqual(StatusCodes.CREATED)

    const resApagado = await testServer.delete(`/products/${res1.body}`).send();

    expect(resApagado.statusCode).toEqual(StatusCodes.NO_CONTENT)
  })
  it('Try to delete a register with an invalid id', async () => {
    const res1 = await testServer.delete('/products/-1')

    expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
    expect(res1.body).toHaveProperty('errors.params.id')
  })
})