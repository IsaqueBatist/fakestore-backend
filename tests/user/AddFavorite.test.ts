import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"
import { createAndLoginUser } from "../utils/CreateAndLoginUser";

describe('User - add Favorite', () => {
  let productId = 0;
  let userToken = '';

  beforeAll(async () => {
    const adminToken = await testServer.post('/login').send({
      email: 'admin@exemple.com',
      password_hash: 'adminSenha123'
    })
    //Criar produto
    const newProduct = await testServer.post('/products').set('authorization', `Bearer ${adminToken.body.accessToken}`).send({
      name: "Tênis Esportivo",
      description: "Tênis confortável para corrida e caminhada.",
      price: 199.90,
      image_url: "https://example.com/images/tenis-esportivo.jpg",
      rating: 4.5
    })
    productId = newProduct.body
    const loginUser = await createAndLoginUser({
      name: 'Isaque Teste',
      email: 'isaqueteste@gmail.com',
      password_hash: 'senha123456'
    })
    userToken = loginUser.token
  })

  it('Should add a favorite', async () => {
    const addFavorite = await testServer.post('/favorites').set('authorization', `Bearer ${userToken}`).send({
      product_id: productId
    })
    expect(addFavorite.status).toEqual(StatusCodes.CREATED)
    expect(typeof addFavorite.body).toEqual("number")
  })
  it('Try to favorite a non-existent produtct', async () => {
    const addFavorite = await testServer.post('/favorites').set('authorization', `Bearer ${userToken}`).send({
      product_id: 99999
    })
    expect(addFavorite.status).toEqual(StatusCodes.NOT_FOUND)
    expect(addFavorite.body).toHaveProperty("errors.default")
  })
  it('Try to favorite a product again', async () => {
    const existentFavorite = await testServer.post('/favorites').set('authorization', `Bearer ${userToken}`).send({
      product_id: productId
    })
    expect(existentFavorite.status).toEqual(StatusCodes.CONFLICT)
    expect(existentFavorite.body).toHaveProperty("errors.default")
  })
  it('Try to favorite a product without authorization', async () => {
    const existentFavorite = await testServer.post('/favorites').send({
      product_id: productId
    })
    expect(existentFavorite.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(existentFavorite.body).toHaveProperty("errors.default")
  })
  it('Try to favorite a product with an invalid ID', async () => {
    const invalidFavorite = await testServer.post('/favorites').set('authorization', `Bearer ${userToken}`).send({
      product_id: ''
    })
    expect(invalidFavorite.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(invalidFavorite.body).toHaveProperty("errors.body.product_id")  
  })
})