import Header from '@/components/Header';
import Scoreboard from '@/components/Scoreboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Scoreboard />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Texas High School Football Tracker • UIL • TAPPS</p>
          <p className="mt-2">
            Data sourced from MaxPreps, UIL, and Dave Campbell&apos;s Texas Football
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <a 
              href="https://www.wright-sports.com"
              className="text-orange-400 hover:text-orange-300"
            >
              Pro Sports Tracker
            </a>
            <span>•</span>
            <a 
              href="https://www.uiltexas.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              UIL Official
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
