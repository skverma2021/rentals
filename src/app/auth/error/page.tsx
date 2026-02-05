"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "Your email is not authorized to access this system. Please contact your agency administrator.",
    Verification: "The verification link has expired or has already been used.",
    Default: "An error occurred during authentication.",
  };

  const message = errorMessages[error || "Default"] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-700 to-red-500 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="p-4 bg-red-100 rounded-full">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">{message}</p>
          <Button asChild size="lg">
            <Link href="/auth/signin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Try Again
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-700 to-red-500">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
