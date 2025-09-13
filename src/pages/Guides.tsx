import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { guides } from '@/content/guides'

export default function Guides() {
  return (
    <div className="min-h-screen">
      <section className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Guides</h1>
          <p className="text-gray-600">Short, practical reads to improve your agile ceremonies</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {guides.map(post => (
            <Card key={post.slug} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{post.title}</CardTitle>
                <CardDescription>{post.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                  <span>{post.minutesToRead} min read</span>
                </div>
                <Link to={`/guides/${post.slug}`} className="text-blue-600 font-medium hover:underline">
                  Read guide →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

