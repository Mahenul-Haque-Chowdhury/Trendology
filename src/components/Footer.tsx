export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-10 border-t border-gray-200 bg-white">
      <div className="mx-auto w-full max-w-[1600px] px-2 sm:px-3 md:px-4 py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div className="space-y-2">
            <div className="text-base font-semibold">AamarDokan</div>
            <p className="text-gray-600">Quality products at fair prices. Fast checkout and delivery.</p>
          </div>
          <div className="space-y-2">
            <div className="font-medium">Support</div>
            <ul className="space-y-1 text-gray-600">
              <li><a className="link" href="/privacy-policy">Privacy Policy</a></li>
              <li><a className="link" href="/terms">Terms & Conditions</a></li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="font-medium">Contact</div>
            <ul className="space-y-1 text-gray-600">
              <li>Email: support@aamardokan.example</li>
              <li>Hours: 9am–9pm</li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="font-medium">Follow</div>
            <p className="text-gray-600">Facebook • Instagram • X</p>
          </div>
        </div>
        <div className="mt-8 text-gray-500 text-xs">© {year} AamarDokan. All rights reserved.</div>
      </div>
    </footer>
  )
}
