export default function Footer() {
  return (
    <footer className="border-t mt-10">
      <div className="container mx-auto px-4 py-8 text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <div className="font-semibold text-gray-900">AamarDokan</div>
          <p className="mt-2 max-w-sm">A clean, fast shopping experience built with Next.js and Tailwind CSS.</p>
        </div>
        <div className="sm:justify-self-center">
          <ul className="space-y-2">
            <li><a className="hover:text-gray-900" href="/">Home</a></li>
            <li><a className="hover:text-gray-900" href="#products">Products</a></li>
            <li><a className="hover:text-gray-900" href="/account">Account</a></li>
            <li><a className="hover:text-gray-900" href="/privacy-policy">Privacy Policy</a></li>
            <li><a className="hover:text-gray-900" href="/terms">Terms &amp; Conditions</a></li>
          </ul>
        </div>
        <div className="sm:justify-self-end">
          <p className="opacity-80">Next.js · TypeScript · Tailwind CSS</p>
          <p className="mt-2">© {new Date().getFullYear()} AamarDokan By <a href="https://arnob.life/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-900">Arnob</a></p>
        </div>
      </div>
    </footer>
  )
}
