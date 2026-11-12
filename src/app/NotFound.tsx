import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="mx-auto grid min-h-dvh max-w-xl place-content-center gap-4 px-4 text-center">
      <h1 className="text-5xl font-extrabold">This trail went cold</h1>
      <p className="text-muted">We couldn’t find that page. The pets are still waiting, though.</p>
      <Link to="/pets" className="mx-auto inline-flex h-12 items-center rounded-full bg-primary px-6 font-bold text-white hover:bg-primary-hover">
        Meet the pets
      </Link>
    </section>
  )
}
