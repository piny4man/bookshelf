import { useQuery, useMutation, queryCache } from 'react-query'
import { setQueryDataForBook } from './books'
import { client } from 'utils/api-client'

const useListItems = (user) => {
  const { data: listItems } = useQuery({
    queryKey: 'list-items',
    queryFn: () =>
      client(`list-items`, { token: user.token }).then(data => data.listItems),
    config: {
      onSuccess(listItems) {
        for (const listItem of listItems) {
          setQueryDataForBook(listItem.book)
        }
      }
    }
  })

  return listItems ?? []
}

const useListItem = (user, bookId) => {
  const listItems = useListItems(user)
  return listItems?.find(li => li.bookId === bookId) ?? null
}

const defaultMutationOptions = {
  onError: (err, variables, recover) =>
    typeof recover === 'function' ? recover : null,
  onSettled: () => queryCache.invalidateQueries('list-items'),
}

const useUpdateListItem = (user, options) => {
  return useMutation(
    updates => client(`list-items/${updates.id}`, { method: 'PUT', data: updates, token: user.token }),
    {
      onMutate: (updatedItem) => {
        const previousItems = queryCache.getQueryData('list-items')

        queryCache.setQueryData('list-items', old => {
          return old.map(item => {
            return item.id === updatedItem.id ? { ...item, ...updatedItem } : item
          })
        })

        return () => queryCache.setQueryData('list-items', previousItems)
      },
      ...defaultMutationOptions,
      ...options
    }
  )
}

const useRemoveListItem = (user, options) => {
  return useMutation(
    ({ id }) => client(`list-items/${id}`, { method: 'DELETE', token: user.token }),
    {
      onMutate: (remvedItem) => {
        const previousItems = queryCache.getQueryData('list-items')

        queryCache.setQueryData('list-items', old => {
          return old.filter(item => item.id !== remvedItem.id)
        })

        return () => queryCache.setQueryData('list-items', previousItems)
      },
      ...defaultMutationOptions,
      ...options
    }
  )
}

const useCreateListItem = (user, options) => {
  return useMutation(
    ({ bookId }) => client('list-items', { data: { bookId }, token: user.token }),
    { ...defaultMutationOptions, ...options }
  )
}

export { useListItems, useListItem, useUpdateListItem, useRemoveListItem, useCreateListItem }
