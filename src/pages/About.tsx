import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function About() {
  return (
    <div className="min-h-screen">
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">About FreeAgilePoker</h1>
          <p className="text-gray-600">Purpose-built tools for fast, private, and delightful agile ceremonies</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Our Purpose</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              <p className="mb-3">
                FreeAgilePoker helps teams run real-time agile ceremonies without friction or sign-ups.
                Create ephemeral rooms, collaborate instantly, and let the data disappear when you are done.
              </p>
              <p>
                The product focuses on clarity, speed, and trust—keeping your team in flow while protecting privacy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Creator</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              <p className="mb-3">
                Built and maintained by <strong>Ravi Peddyreddy</strong> with deep experience in agile delivery and front-end engineering.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Hands-on experience facilitating sprint planning and retrospectives</li>
                <li>Focus on real-time UX, performance, and zero-persistence privacy</li>
                <li>Passionate about simple, modern product design</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              <p className="mb-2">
                Phone: <a className="text-blue-600 hover:underline" href="tel:+16124238425">+1 (612) 423-8425</a>
              </p>
              <p>
                LinkedIn: <a className="text-blue-600 hover:underline" href="https://www.linkedin.com/in/ravi-p-171281180" target="_blank" rel="noopener noreferrer">Ravi Peddyreddy</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

