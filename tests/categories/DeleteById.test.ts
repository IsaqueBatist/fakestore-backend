import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"

describe('Categories - DeleteById', () => {
  let categoryId: number = 0
  let adminToken: string = ''

  beforeAll(async () => {
    const admin = await testServer.post('/login').send({
      email: 'admin@exemple.com',
      password_hash: 'adminSenha123'
    })

    adminToken = admin.body.accessToken

    const newCategory = await testServer.post('/categories').set('authorization', `Bearer ${adminToken}`).send({
      name: "Categoria Teste",
      description: "Categoria feita para testar"
    })
    categoryId = newCategory.body
  })
  
  it('Should delete an existing category', async () => {
    const deletedCategory = await testServer.delete(`/categories/${categoryId}`).set('authorization', `Bearer ${adminToken}`).send()

    expect(deletedCategory.status).toEqual(StatusCodes.NO_CONTENT)
  })
  it('Try to delete a non-existing category',async () => {
    const deletedCategory = await testServer.delete(`/categories/${categoryId}`).set('authorization', `Bearer ${adminToken}`).send()

    expect(deletedCategory.status).toEqual(StatusCodes.NOT_FOUND)  
    expect(deletedCategory.body).toHaveProperty('errors.default')  
  })
  it('Try to delete a category with a negative Id',async () => {
    const deletedCategory = await testServer.delete(`/categories/-1`).set('authorization', `Bearer ${adminToken}`).send()

    expect(deletedCategory.status).toEqual(StatusCodes.BAD_REQUEST)  
    expect(deletedCategory.body).toHaveProperty('errors.params.id')  
  })
  it('Try to delete a category without authorization',async () => {
    const deletedCategory = await testServer.delete(`/categories/${categoryId}`).send()

    expect(deletedCategory.status).toEqual(StatusCodes.UNAUTHORIZED)  
    expect(deletedCategory.body).toHaveProperty('errors.default')  
  })
})