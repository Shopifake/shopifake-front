import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ArrowLeft } from "lucide-react";
import { Logo } from "../shared/Logo";
import { useAuth } from "../../hooks/auth-b2e/index";

export function OwnerLogin({ onLogin, onSwitchToSignup, onReturnToMain }: { onLogin: () => void; onSwitchToSignup: () => void; onReturnToMain?: () => void }) {
  const [email, setEmail] = useState("a@a");
  const [password, setPassword] = useState("password");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const result = await login({ email, password });
      if (result) onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {onReturnToMain && (
          <div className="mb-4">
            <Button variant="ghost" onClick={onReturnToMain} className="gap-2 text-white hover:text-white/80 hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" />
              Back to Main Menu
            </Button>
          </div>
        )}
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        
        <Card className="shadow-lg bg-zinc-900 border-zinc-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-white">Welcome back</CardTitle>
            <CardDescription className="text-zinc-400">Sign in to your Shopifake account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 ${errors.email ? "border-destructive" : ""}`}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 ${errors.password ? "border-destructive" : ""}`}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              {isLoading && (
                <p className="text-sm text-zinc-400">Signing in, please wait...</p>
              )}

              <Button type="submit" className="w-full bg-black hover:bg-zinc-950 text-white border border-zinc-700" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-zinc-400">
              Don't have an account?{" "}
              <button
                onClick={onSwitchToSignup}
                className="text-white hover:underline"
              >
                Sign up
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
