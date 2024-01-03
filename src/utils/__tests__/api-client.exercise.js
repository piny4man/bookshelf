import { server, rest } from 'test/server'
import { client } from '../api-client'

const apiURL = process.env.REACT_APP_API_URL

beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

test('calls fetch at the endpoint with the arguments for GET requests', async () => {
  const endpoint = 'test-endpoint'
  const mockResult = { mockValue: 'VALUE' }

  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.json(mockResult))
    }),
  )

  const result = await client(endpoint)
  expect(result).toEqual(mockResult)
})

test('adds auth token when a token is provided', async () => {
  const token = 'SOME_TOKEN'
  let request
  const endpoint = 'test-endpoint'
  const mockResult = { mockValue: 'VALUE' }

  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json(mockResult))
    }),
  )

  await client(endpoint, { token })
  expect(request.headers.get('Authorization')).toBe(`Bearer ${token}`)
})

test('allows for config overrides', async () => {
  let request
  const endpoint = 'test-endpoint'
  const mockResult = { mockResult: 'VALUE' }

  server.use(
    rest.put(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json(mockResult))
    })
  )

  const customConfig = {
    method: 'PUT',
    mode: 'cors',
    headers: { 'Content-Type': 'mock-custom-type' }
  }

  await client(endpoint, customConfig)
  expect(request.headers.get('Content-Type')).toBe('mock-custom-type')
  expect(request.mode).toEqual('cors')
  expect(request.method).toEqual('PUT')
})

test(
  'when data is provided, it is stringified and the method defaults to POST', async () => {
    const endpoint = 'test-endpoint'

    server.use(
      rest.post(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
        return res(ctx.json(req.body))
      })
    )

    const data = { mock: 'data' }
    const result = await client(endpoint, { data })
    expect(result).toEqual(data)
  }
)

