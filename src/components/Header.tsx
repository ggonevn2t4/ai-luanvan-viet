import { Button } from "@/components/ui/button";
import { BookOpen, Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Đăng xuất thành công",
        description: "Hẹn gặp lại bạn!",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Lỗi đăng xuất",
        description: "Đã có lỗi xảy ra. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    { name: "Trang chủ", path: "/" },
    ...(user ? [{ name: "Dashboard", path: "/dashboard" }] : []),
    { name: "Viết luận văn", path: "/write" },
    { name: "Bảng giá", path: "/pricing" },
    { name: "Về chúng tôi", path: "/about" },
    { name: "FAQ", path: "/faq" },
    { name: "Liên hệ", path: "/contact" }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="vietnamese-header border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-all duration-300 hover:scale-105">
            <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow animate-pulse-glow">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient font-vietnamese">AI Luận Văn</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-all duration-300 hover:text-primary hover:scale-105 ${
                  isActive(item.path) 
                    ? "text-primary font-semibold" 
                    : "text-muted-foreground hover:text-gradient"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="glass" size="sm" className="hover:scale-110">
                    <User className="w-4 h-4 mr-2" />
                    {user.email?.split('@')[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card border-white/20">
                  <DropdownMenuItem onClick={handleSignOut} className="hover:bg-primary/10">
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="glass" size="sm" asChild>
                  <Link to="/auth">Đăng nhập</Link>
                </Button>
                <Button variant="vietnamese" size="sm" asChild className="animate-pulse-glow">
                  <Link to="/auth">Dùng thử miễn phí</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl glass hover:scale-110 transition-all duration-300"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 glass-card mt-4 rounded-2xl mx-4 animate-slide-up">
            <nav className="flex flex-col space-y-4 p-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium transition-all duration-300 hover:text-primary hover:translate-x-2 ${
                    isActive(item.path) ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-3 pt-4 border-t border-white/10">
                {user ? (
                  <Button variant="glass" size="sm" onClick={handleSignOut} className="justify-start">
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                  </Button>
                ) : (
                  <>
                    <Button variant="glass" size="sm" asChild>
                      <Link to="/auth">Đăng nhập</Link>
                    </Button>
                    <Button variant="vietnamese" size="sm" asChild>
                      <Link to="/auth">Dùng thử miễn phí</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;