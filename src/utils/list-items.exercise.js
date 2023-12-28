import { useQuery, useMutation, queryCache } from 'react-query'
import { client } from 'utils/api-client'

const useListItems = (user) => {
  const { data: listItems } = useQuery({
    queryKey: 'list-items',
    queryFn: () =>
      client(`list-items`, { token: user.token }).then(data => data.listItems),
  })

  return listItems ?? []
}

const useListItem = (user, bookId) => {
  const listItems = useListItems(user)
  return listItems?.find(li => li.bookId === bookId) ?? null
}

const defaultMutationOptions = {
  onSettled: () => queryCache.invalidateQueries('list-items'),
}

const useUpdateListItem = (user, options) => {
  return useMutation(
    updates => client(`list-items/${updates.id}`, { method: 'PUT', data: updates, token: user.token }),
    { ...defaultMutationOptions, ...options }
  )
}

const useRemoveListItem = (user, options) => {
  return useMutation(
    ({ id }) => client(`list-items/${id}`, { method: 'DELETE', token: user.token }),
    { ...defaultMutationOptions, ...options }
  )
}

const useCreateListItem = (user, options) => {
  return useMutation(
    ({ bookId }) => client('list-items', { data: { bookId }, token: user.token }),
    { ...defaultMutationOptions, ...options }
  )
}

export { useListItems, useListItem, useUpdateListItem, useRemoveListItem, useCreateListItem }
