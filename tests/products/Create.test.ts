import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"

describe('Products - Create', () => {
  it('Create register', async () => {

    const res1 = await testServer.post('/products').send({name: 'Notebook'})

    expect(res1.statusCode).toEqual(StatusCodes.CREATED)
    expect(typeof res1.body).toEqual('number') 
  })
  it('Try to create a register with a short name', async () => {

    const res1 = await testServer.post('/products').send({name: 'Co'})

    expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
    expect(res1.body).toHaveProperty('errors.body.name') 
  })
  it('Try to create a register without name', async () => {

    const res1 = await testServer.post('/products').send({})

    expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
    expect(res1.body).toHaveProperty('errors.body.name') 
  })
})
