import Link from 'next/link';
import Image from 'next/image';

export default function NavBar() {
  return (
    <nav className="fixed top-0 left-1/2 -translate-x-1/2 w-[99%] bg-[#24252A] z-[1000] rounded-[12px] p-[15px] px-[30px] mx-auto flex flex-wrap items-center justify-between shadow-[0_4px_15px_rgba(0,0,0,0.6)]">
      <div className="left-group">
        <Link href="/" className="logo-container">
          <Image
            src="/logo.svg"
            alt="Quantapus Logo"
            width={40}
            height={40}
            className="logo"
          />
        </Link>

        {/* Main links */}
        <div className="nav-links">
          <Link href="/roadmap" className="nav-item">
            Roadmap
          </Link>
          <Link href="/problems" className="nav-item">
            Problems
          </Link>
        </div>
      </div>

      {/* CTA / dropdown */}
      <div className="cta">
        <button id="signInButton">Sign In</button>
        <div id="dropdownMenu" className="dropdown">
          <Link href="#" id="accountLink">Account</Link>
          <Link href="#" id="signOutLink">Sign Out</Link>
        </div>
      </div>
    </nav>
  );
}
