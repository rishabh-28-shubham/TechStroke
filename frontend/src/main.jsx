import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Error from './pages/Error.jsx'
import DashBoard from './pages/DashBoard.jsx'
import Snippets from './pages/Snippets.jsx'
import ApiTester from './pages/ApiTester.jsx'
import EnvManager from './pages/EnvManager.jsx'
import Documentation from './pages/Documentation.jsx'
import CodeCollab from './pages/CodeCollab.jsx'
import Diagram from './pages/Diagram.jsx'
import React from 'react'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <DashBoard/>,
      },
      {
        path: 'snippets',
        element: <Snippets />,
      },
      {
        path: 'api-tester',
        element: <ApiTester />,
      },
      {
        path: 'env-manager',
        element: <EnvManager />,
      },
      {
        path: 'documentation',
        element: <Documentation />,
      },
      {
        path: 'codecollab',
        element: <CodeCollab />,
      },
      {
        path:'diagram',
        element:<Diagram/>
      }
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)