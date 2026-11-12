import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from '@/app/Layout'
import { SmoothScroll } from '@/app/SmoothScroll'
import { IntroLoader } from '@/app/loader/IntroLoader'
import { ToastProvider } from '@/components/ui/Toast'

// Feature pages (owned by feature engineers) — lazy so the 3D bundle only loads on the story page.
const StoryPage = lazy(() => import('@/experience/StoryPage'))
const CatalogPage = lazy(() => import('@/features/pets/CatalogPage'))
const PetProfilePage = lazy(() => import('@/features/pets/PetProfilePage'))
const MatchPage = lazy(() => import('@/features/match/MatchPage'))
const MatchResultsPage = lazy(() => import('@/features/match/MatchResultsPage'))
const SavedPage = lazy(() => import('@/features/pets/SavedPage'))
const AdoptPage = lazy(() => import('@/features/adopt/AdoptPage'))
const NotFound = lazy(() => import('@/app/NotFound'))

function PageFallback() {
  return (
    <div className="grid min-h-dvh place-items-center" role="status">
      <span className="font-display text-lg font-bold text-muted">Fetching the good boys…</span>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <SmoothScroll>
        <IntroLoader />
        <ToastProvider>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<StoryPage />} />
              <Route path="pets" element={<CatalogPage />} />
              <Route path="pets/:id" element={<PetProfilePage />} />
              <Route path="match" element={<MatchPage />} />
              <Route path="match/results" element={<MatchResultsPage />} />
              <Route path="saved" element={<SavedPage />} />
              <Route path="adopt/:petId" element={<AdoptPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
        </ToastProvider>
      </SmoothScroll>
    </BrowserRouter>
  )
}
