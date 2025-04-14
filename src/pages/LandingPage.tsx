import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import UploadStatementButton from "@/components/Upload/LoadDataButton";
import useTransactionStore from "@/stores/transactions.store";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import logoLg from "../assets/logo-lg.svg";

function CountPesaLanding() {
  const trs = useTransactionStore((state) => state.transactions);

  const goToDemo = async () => {
    window.location.href = "/demo/dashboard";
  };

  const onDownload = () => {
    window.open(
      "https://play.google.com/store/apps/details?id=com.countpesa&utm_source=website&utm_medium=hero&utm_campaign=web_app_promo",
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Navigation */}
      <nav className="sticky top-0 bg-background border-b border-foreground/15 z-50">
        <div className="flex h-14 items-center justify-between mx-auto px-4">
          <a
            href="https://countpesa.com"
            target="_blank"
            className="flex items-center cursor-pointer"
            rel="noreferrer"
          >
            {/* Logo Placeholder */}
            <img src={logoLg} alt="CountPesa" className="w-36 h-16 mr-4" />
          </a>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onDownload}>
              Download App
            </Button>
            {trs.length > 0 && (
              <Link to="/dashboard" className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Home size={20} />
                </Button>
              </Link>
            )}
            <ThemeToggle showLabel={false} />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-12 pb-6 max-w-6xl">
        <header className="text-center mb-16">
          <h1 className="text-2xl md:text-4xl font-semibold tracking-tight mb-4">
            Transform M-Pesa Data into Actionable Insights
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Turn your M-Pesa data into clear, actionable insights.
          </p>
          <div className="text-lg text-muted-foreground mb-8">
            <p>All data is stored locally in your browser, with zero server storage.</p>
            <p className="pt-2">100% for your eyes only.</p>
          </div>

          <div className="flex justify-center gap-4 mb-12">
            <UploadStatementButton variant="default" />
            <Button variant="outline" size="lg" onClick={goToDemo}>
              Explore Demo
            </Button>
          </div>
        </header>

        {/* Loom Video Embed */}
        <div className="mb-8 overflow-hidden rounded-lg shadow-lg mx-auto max-w-4xl">
          <div className="bg-black">
            <div className="relative mt-4 pb-[45.833%] h-0 rounded overflow-hidden">
              <iframe
                title="CountPesa Demo Video"
                src="https://www.loom.com/embed/f48117983d994fcb8b72fd4068a0a863?sid=aebc15da-e4db-4365-b654-bbaf734a59e6"
                frameBorder="0"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="text-center mb-20">
          <p className="text-xl">
            Discover patterns, pinpoint wasteful expenses, and take control of your finances.
          </p>
        </div>

        {/* How It Works Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="transition-all duration-300 hover:shadow rounded-lg">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-gray-300/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📄</span>
                </div>
                <CardTitle className="text-xl font-bold">1. Get Full Statement</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground text-sm pt-2">
                <p>
                  Obtain your statement from the MySafaricom app or by dialing *334#. Follow the
                  steps: &quot;My Account &gt; M-PESA Statement...&quot; to get your full M-PESA
                  statement.
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="transition-all duration-300 hover:shadow rounded-lg">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-gray-300/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔄</span>
                </div>
                <CardTitle className="text-xl font-bold">2. Data Transformation</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground text-sm pt-2">
                <p>
                  Upload the emailed statement and enter the SMS-sent password. We&apos;ll transform
                  your statement into an easily analyzable format.
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="transition-all duration-300 hover:shadow rounded-lg">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-gray-300/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📊</span>
                </div>
                <CardTitle className="text-xl font-bold">3. Count Pesa</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground text-sm pt-2">
                <p>
                  Analyze your transactions using our powerful interactive dashboards, aided by an
                  AI copilot. Understand your spending patterns and find opportunities to save!
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
      {/* Footer */}
      <footer className="text-center py-6 border-t border-foreground/15">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} CountPesa. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default CountPesaLanding;
