import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"

describe('Products - getAll', () => {
  it('Shoud get all products', async () => {
    const res1 = await testServer.get('/products')


    expect(Number(res1.headers['x-total-count'])).toBeGreaterThan(0)
    expect(res1.statusCode).toEqual(StatusCodes.OK)
    expect(Number(res1.body.length)).toBeGreaterThan(0)
  })
  it('Try to get all products with a negative page', async () => {
    const res1 = await testServer.get('/products?page=-1')

    expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
    expect(res1.body).toHaveProperty('errors.query.page')
  })
  it('Try to get all products with a negative limit', async () => {
    const res1 = await testServer.get('/products?limit=-1')

    expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
    expect(res1.body).toHaveProperty('errors.query.limit')
  })
})