import { RouterProvider } from 'react-router-dom'
import { Toaster } from './components/ui/sonner'
import { route } from './router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'

function App() {

  return (
    <>
      <Toaster richColors position='top-right' />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={route} />
      </QueryClientProvider>
    </>
  )
}

export default App
