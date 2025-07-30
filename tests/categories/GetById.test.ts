import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"

describe('Categories - GetById', () => {
  let categoryId: number = 0
  beforeAll(async () => {
    const admin = await testServer.post('/login').send({
      email: 'admin@exemple.com',
      password_hash: 'adminSenha123'
    })

    const category = await testServer.post('/categories').set('authorization', `Bearer ${admin.body.accessToken}`).send({
      name: "Categoria Teste ",
      description: "Categoria feita para testar"
    })
    categoryId = category.body
  })
  
  it('Should get a category by id', async () => {
    const getCategory = await testServer.get(`/categories/${categoryId}`).send()

    expect(getCategory.status).toEqual(StatusCodes.OK)
    expect(getCategory.body).toHaveProperty('id_category')
    expect(Number(getCategory.body.id_category)).toEqual(categoryId)
  })
  it('Try to get a non-existing category', async () => {
    const getCategory = await testServer.get(`/categories/${categoryId+1}`).send()

    expect(getCategory.status).toEqual(StatusCodes.NOT_FOUND)
    expect(getCategory.body).toHaveProperty('errors.default')
  })
  it('Try to get category with negative Id', async () => {
    const getCategory = await testServer.get(`/categories/-1`).send()

    expect(getCategory.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(getCategory.body).toHaveProperty('errors.params.id')
  })
})