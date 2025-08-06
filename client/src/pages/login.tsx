import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSigningIn(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Login failed");
        setSigningIn(false);
        return;
      }
      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username || email);
      if (data.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex justify-center">
        <img 
          src="/zeeder-ai-logo.png" 
          alt="Zeeder AI Logo" 
          className="h-6 w-auto object-contain"
          onError={(e) => {
            console.error('Failed to load logo:', e);
          }}
        />
      </div>
      <div className="w-full max-w-md">
        <Card className="bg-card border-border shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-semibold text-foreground">
              Sign in
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              To continue to Zeeder
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email or username
                </Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border-border focus:border-primary"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-background border-border focus:border-primary pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Keep me signed in */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="keep-signed-in"
                  checked={keepSignedIn}
                  onCheckedChange={(checked) => setKeepSignedIn(checked as boolean)}
                />
                <div className="space-y-1">
                  <Label 
                    htmlFor="keep-signed-in" 
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    Keep me signed in
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Recommended on trusted devices.{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                    >
                      Why?
                    </button>
                  </p>
                </div>
              </div>

              {/* Sign in Button */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium flex items-center justify-center"
                disabled={signingIn}
              >
                {signingIn ? (
                  <>
                    Signing in
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            {/* Additional Links */}
            <div className="text-center space-y-3 pt-4">
              <button className="text-sm text-primary hover:underline">
                Trouble signing in?
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground space-x-4">
          <button className="hover:text-foreground">Terms</button>
          <span>|</span>
          <button className="hover:text-foreground">Privacy policy</button>
          <span>|</span>
          <span>Version 1.0.0</span>
        </div>
      </div>
    </div>
  );
}