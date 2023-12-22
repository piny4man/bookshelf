/** @jsx jsx */
import { jsx } from '@emotion/core'
import * as React from 'react'
import * as auth from 'auth-provider'
import { AuthenticatedApp } from './authenticated-app'
import { UnauthenticatedApp } from './unauthenticated-app'
import { client } from './utils/api-client'
import { useAsync } from './utils/hooks'
import { FullPageSpinner } from './components/lib'
import * as colors from './styles/colors'

const getUser = async () => {
  let user = null
  const token = await auth.getToken()
  if (token) {
    const response = await client('me', { token })
    user = response.user
  }

  return user
}

function App() {
  const { data: user, setData, run, error, isLoading, isIdle, isError } = useAsync()

  const login = form => auth.login(form).then(u => setData(u))
  const register = form => auth.register(form).then(u => setData(u))
  const logout = () => {
    auth.logout()
    setData(null)
  }

  React.useEffect(() => {
    run(getUser())
  }, [run])

  if (isLoading || isIdle) return <FullPageSpinner />
  if (isError) {
    return (
      <div
        css={{
          color: colors.danger,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <p>Uh oh... There's a problem. Try refreshing the app.</p>
        <pre>{error.message}</pre>
      </div>
    )
  }
  if (Boolean(user)) return <AuthenticatedApp user={user} logout={logout} />
  return <UnauthenticatedApp login={login} register={register} />
}

export { App }

/*
eslint
  no-unused-vars: "off",
*/
