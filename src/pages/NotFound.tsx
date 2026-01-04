import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-6">
        <div className="mb-6">
          <span className="text-8xl font-light text-primary/30">404</span>
        </div>
        <h1 className="mb-3 text-2xl font-medium text-foreground">
          {t("error.notFound")}
        </h1>
        <p className="mb-6 text-muted-foreground max-w-md mx-auto">
          {t("error.notFoundDesc")}
        </p>
        <Link to="/">
          <Button className="gap-2">
            <Home className="w-4 h-4" />
            {t("error.goHome")}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
