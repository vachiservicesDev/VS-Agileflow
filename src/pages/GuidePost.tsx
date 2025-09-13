import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getGuideBySlug } from '@/content/guides'

export default function GuidePost() {
  const { slug } = useParams()
  const post = slug ? getGuideBySlug(slug) : undefined

  if (!post) {
    return (
      <div className="min-h-screen">
        <section className="container mx-auto px-4 py-12 max-w-3xl text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Guide not found</h1>
          <p className="text-gray-600 mb-6">The guide you are looking for does not exist.</p>
          <Link to="/guides" className="text-blue-600 hover:underline">Back to Guides</Link>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-6">
          <Link to="/guides" className="text-blue-600 hover:underline">← All Guides</Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{post.title}</CardTitle>
            <div className="text-sm text-gray-500">{new Date(post.date).toLocaleDateString()} • {post.minutesToRead} min read</div>
          </CardHeader>
          <CardContent className="prose prose-neutral max-w-none">
            {post.body.map((p, idx) => (
              <p key={idx} className="text-gray-800 leading-relaxed mb-4">{p}</p>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

