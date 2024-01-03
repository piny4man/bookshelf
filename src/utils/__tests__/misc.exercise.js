import { formatDate } from '../misc'

test('formatDate formats the date to look nice', () => {
  expect(formatDate(new Date('September 23, 1937'))).toBe('Sep 37')
})

