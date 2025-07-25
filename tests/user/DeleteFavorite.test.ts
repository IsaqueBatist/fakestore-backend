import { StatusCodes } from "http-status-codes"
import { testServer } from "../jest.setup"
import { createAndLoginUser } from "../utils/CreateAndLoginUser";

describe('User - remove Favorite', () => {
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
    //Adcionar ao favorite
    await testServer.post('/favorites').set('authorization', `Bearer ${userToken}`).send({
      product_id: productId
    })
  })
  
  it('Should remove a favorite', async () => {
    const removeFavorite = await testServer.delete(`/favorites/${productId}`).set('authorization', `Bearer ${userToken}`).send()
    expect(removeFavorite.status).toEqual(StatusCodes.NO_CONTENT)
  })
  it('Try to remove favorite a non-existent produtct', async () => {
    const removeNoExisingFavorite = await testServer.delete(`/favorites/${productId}`).set('authorization', `Bearer ${userToken}`).send()
    expect(removeNoExisingFavorite.status).toEqual(StatusCodes.NOT_FOUND)
    expect(removeNoExisingFavorite.body).toHaveProperty("errors.default")
  })
  it('Try to remove a favorite without authorization', async() => {
    const removeFavorite = await testServer.delete(`/favorites/${productId}`).send()
    expect(removeFavorite.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(removeFavorite.body).toHaveProperty("errors.default")  
  })
})