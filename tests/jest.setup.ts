import supertest from 'supertest'

import {server} from '../src/server/server'



export const testServer = supertest(server)


testServer.get('/products/1')