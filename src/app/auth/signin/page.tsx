"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Github, AlertCircle, Loader2 } from "lucide-react";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-500 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Building2 className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-2xl">Asset Rental System</CardTitle>
          <CardDescription>
            Sign in to access your agency&apos;s dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error === "AccessDenied" 
                  ? "Access denied. Your email is not authorized. Please contact your agency administrator."
                  : "An error occurred during sign in. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button
              onClick={() => signIn("github", { callbackUrl })}
              className="w-full bg-[#24292f] hover:bg-[#1b1f23] text-white"
              size="lg"
            >
              <Github className="h-5 w-5 mr-2" />
              Sign in with GitHub
            </Button>

            <Button
              onClick={() => signIn("google", { callbackUrl })}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Only pre-authorized agency employees can access this system.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-500">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
