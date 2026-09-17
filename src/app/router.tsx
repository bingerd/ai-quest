import { createBrowserRouter } from 'react-router-dom'
import { CataloguePage } from './CataloguePage'
import { Layout } from './Layout'
import { LessonPage } from './LessonPage'
import { NotFound } from './NotFound'
import { ResultsPage } from './ResultsPage'
import { TrainingPage } from './TrainingPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <CataloguePage /> },
      { path: 'training/:trainingId', element: <TrainingPage /> },
      { path: 'training/:trainingId/lesson/:lessonId', element: <LessonPage /> },
      { path: 'training/:trainingId/results', element: <ResultsPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
