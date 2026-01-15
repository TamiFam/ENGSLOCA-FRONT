import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import WordListLayout from '../layouts/WordListLayout';
import Home from '../pages/Home';  
import WordList from '../features/words/WordList';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,  // <-- используем твой Home
      },
    ],
  },
  {
    path: '/words',
    element: <WordListLayout />,
    children: [
      {
        index: true,
        element: <WordList />,
      },
    ],
  },
]);

export default router;