import { Button } from "../components/ui/button";
import { Lock, Shield, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/passkeyper.svg";
import demo from "../assets/demo.png";

export default function LandingPage() {
  // Convert Google Drive link to embed format
  const videoId = "1FSTyShrJJBN8cBAaTweOcsVNU2IW_J3W";
  const embedUrl = `https://drive.google.com/file/d/${videoId}/preview`;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <div className="container mx-auto flex items-center justify-between">
          <Link className="flex items-center justify-center" to="/login">
            <div className="h-9 w-9">
              <img src={logo} alt="Passkeyper logo" />
            </div>
            <span className="ml-2 text-xl font-semibold">Passkeyper</span>
          </Link>
          <nav className="flex gap-1">
            <Link to="/signup">
              <Button className="text-md font-semibold" variant="outline">
                Signup
              </Button>
            </Link>
            <Link to="/login">
              <Button className="text-md font-semibold bg-blue-600 hover:bg-blue-500">
                Login
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full">
        <section className="w-full py-12 md:py-24 lg:py-24 xl:py-48">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  One password to rule them all
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Manage all your passwords in one secure place. Stay protected
                  with Passkeyper.
                </p>
              </div>
              <div className="space-x-4">
                <Link to="/signup">
                  <Button className="text-md font-semibold bg-blue-600 hover:bg-blue-500">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="container mx-auto px-4 md:px-6 mt-12">
            <div className="relative w-full max-w-4xl mx-auto aspect-video rounded-md overflow-hidden">
              <iframe
                src={embedUrl}
                className="absolute top-0 left-0 w-full h-full rounded-md"
                allow="autoplay"
                allowFullScreen
                title="Passkeyper Demo Video"
              />
            </div>
          </div>
        </section>

        <section className="w-full py-6 md:py-6 lg:py-14 bg-muted">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
              Secure by Design
            </h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 max-w-6xl mx-auto">
              <div className="flex flex-col items-center space-y-3 text-center">
                <Lock className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Secure Encryption</h3>
                <p className="text-muted-foreground">
                  We use state-of-the-art encryption algorithms to protect your
                  sensitive information from unauthorized access.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <Shield className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">
                  Zero Knowledge Architecture
                </h3>
                <p className="text-muted-foreground">
                  Your data remains encrypted and unreadable, even by our own
                  systems, ensuring maximum privacy and security.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <AlertTriangle className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Data Breach Checking</h3>
                <p className="text-muted-foreground">
                  Proactively monitor and check if your information appears in
                  known data breaches, helping you stay ahead of potential
                  threats.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center max-w-4xl mx-auto">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Secure Your Passwords?
                </h2>
              </div>
              <img
                className="mt-12 w-full rounded-md"
                src={demo}
                alt="demo"
              />
              <div className="w-full max-w-sm space-y-2">
                <Link to="/signup">
                  <Button className="text-md font-semibold bg-blue-600 hover:bg-blue-500">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center">
            <p className="text-xs text-muted-foreground">© 2024 Passkeyper</p>
            <nav className="sm:ml-auto flex gap-4 sm:gap-6">
              <Link className="text-xs hover:underline underline-offset-4" to="#">
                Made with ❤️
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}