
import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"

describe('Products - UpdateById',() =>{
  it('Shoud update a product', async () => {
    const res1 = await testServer.post('/products').send({name: 'Notebook'})

    const updateres = await testServer.put(`/products/${res1.body}`).send({name: 'Smartphone'})
      expect(updateres.statusCode).toEqual(StatusCodes.NO_CONTENT)
  })
  it('Try to update a product with a short name', async () => {
    const res1 = await testServer.put('/products/1').send({name: 'Sm'})
      expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(res1.body).toHaveProperty('errors.body.name')
  })
  it('Try to update a product with a negative id', async () => {
    const res1 = await testServer.put('/products/-1').send({name: 'Smartphone'})
      expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(res1.body).toHaveProperty('errors.params.id')
  })
  
})