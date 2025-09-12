export default function Footer() {
  return (
    <footer className="print-hidden border-t bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold mb-3">Address</h3>
            <p className="text-sm leading-relaxed">
              83 Wooster Heights Rd,<br />
              Suite 125, Danbury, CT 06810
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Contact</h3>
            <p className="text-sm leading-relaxed">
              <a href="tel:+16124238425" className="hover:underline">+1 (612) 423-8425</a><br />
              <a href="https://www.linkedin.com/in/ravi-p-171281180" target="_blank" rel="noopener noreferrer" className="hover:underline">Ravi Peddyreddy</a>
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Hours</h3>
            <p className="text-sm leading-relaxed">
              Monday - Friday<br />
              9:00 AM - 5:00 PM EST
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

