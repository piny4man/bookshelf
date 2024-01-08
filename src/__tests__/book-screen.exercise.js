import * as React from 'react'
import { render, screen, userEvent, waitForLoadingToFinish, loginAsUser } from 'test/app-test-utils'
import faker from 'faker'
import { buildBook, buildListItem } from 'test/generate'
import * as booksDB from 'test/data/books'
import * as listItemsDB from 'test/data/list-items'
import { formatDate } from 'utils/misc'
import { App } from 'app'

const fakeTimerUserEvent = userEvent.setup({
  advanceTimers: () => jest.runOnlyPendingTimers(),
})

async function renderBookScreen({ user, book, listItem } = {}) {
  if (user === undefined) {
    user = await loginAsUser()
  }
  if (book === undefined) {
    book = await booksDB.create(buildBook())
  }
  if (listItem === undefined) {
    listItem = await listItemsDB.create(buildListItem({ owner: user, book }))
  }
  const route = `/book/${book.id}`
  const utils = await render(<App />, { user, route })

  return {
    ...utils,
    book,
    user,
    listItem,
  }
}

test('renders all the book information', async () => {
  const { book } = await renderBookScreen({ listItem: null })

  expect(screen.getByRole('heading', { name: book.title })).toBeInTheDocument()
  expect(screen.getByText(book.author)).toBeInTheDocument()
  expect(screen.getByText(book.publisher)).toBeInTheDocument()
  expect(screen.getByText(book.synopsis)).toBeInTheDocument()
  expect(screen.getByRole('img', { name: /book cover/i })).toHaveAttribute('src', book.coverImageUrl)
  expect(screen.getByRole('button', { name: /add to list/i })).toBeInTheDocument()

  expect(screen.queryByRole('button', { name: /remove from list/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /mark as read/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('textbox', { name: /notes/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('radio', { name: /star/i })).not.toBeInTheDocument()
  expect(screen.queryByLabelText(/start date/i)).not.toBeInTheDocument()
})

test('create a ist item for the book', async () => {
  await renderBookScreen({ listItem: null })

  const addToListButton = screen.getByRole('button', { name: /add to list/i })
  await userEvent.click(addToListButton)
  expect(addToListButton).toBeDisabled()

  await waitForLoadingToFinish()

  expect(screen.getByRole('button', { name: /remove from list/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /mark as read/i })).toBeInTheDocument()
  expect(screen.getByRole('textbox', { name: /notes/i })).toBeInTheDocument()

  const startDateElement = screen.getByLabelText(/start date/i)
  expect(startDateElement).toHaveTextContent(formatDate(Date.now()))

  expect(screen.queryByRole('radio', { name: /add to list/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('radio', { name: /mark as unread/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('radio', { name: /star/i })).not.toBeInTheDocument()
})

test('can remove a list item for the book', async () => {
  await renderBookScreen()

  const removeFromListButton = screen.getByRole('button', { name: /remove from list/i })
  await userEvent.click(removeFromListButton)
  expect(removeFromListButton).toBeDisabled()

  await waitForLoadingToFinish()

  expect(screen.getByRole('button', { name: /add to list/i })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /remove from list/i })).not.toBeInTheDocument()
})

test('can mark a list item as read', async () => {
  const { listItem } = await renderBookScreen()
  await listItemsDB.update(listItem.id, { finishDate: null })

  const markAsReadButton = screen.getByRole('button', { name: /mark as read/i })
  await userEvent.click(markAsReadButton)
  expect(markAsReadButton).toBeDisabled()

  await waitForLoadingToFinish()

  expect(screen.getByRole('button', { name: /mark as unread/i })).toBeInTheDocument()
  expect(screen.getAllByRole('radio', { name: /star/i })).toHaveLength(5)

  const startAndFinishDateNode = screen.getByLabelText(/start and finish date/i)
  expect(startAndFinishDateNode).toHaveTextContent(
    `${formatDate(listItem.startDate)} — ${formatDate(Date.now())}`
  )

  expect(screen.queryByRole('button', { name: /mark as read/i })).not.toBeInTheDocument()
})

test('can edit a note', async () => {
  jest.useFakeTimers()
  const { listItem } = await renderBookScreen()

  const newNotes = faker.lorem.words()
  const notesTextArea = screen.getByRole('textbox', { name: /notes/i })

  await fakeTimerUserEvent.clear(notesTextArea)
  await fakeTimerUserEvent.type(notesTextArea, newNotes)

  await screen.findByLabelText(/loading/i)
  await waitForLoadingToFinish()

  expect(notesTextArea).toHaveTextContent(newNotes)
  expect(await listItemsDB.read(listItem.id)).toMatchObject({
    notes: newNotes,
  })
})

