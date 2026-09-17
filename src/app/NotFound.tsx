import { Link } from 'react-router-dom'

export function NotFound({ message = 'Page not found.' }: { message?: string }) {
  return (
    <div className="card mx-auto max-w-md space-y-4 p-8 text-center animate-rise">
      <p className="text-5xl" aria-hidden>
        🧭
      </p>
      <h1 className="text-xl font-semibold">{message}</h1>
      <Link to="/" className="btn btn-primary">
        Back to trainings
      </Link>
    </div>
  )
}
