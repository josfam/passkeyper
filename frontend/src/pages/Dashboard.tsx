import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Eye,
  EyeOff,
} from "lucide-react";
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";
import axios from "axios";

// Initialize zxcvbn
const options = {
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
};
zxcvbnOptions.setOptions(options);

interface PasswordData {
  id: string;
  hash: string;
}

interface BreachCheckResponse {
  breaches: string[][];
}

function SecurityDashboard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailBreaches, setEmailBreaches] = useState<string[]>([]);
  const [passwordBreached, setPasswordBreached] = useState<boolean | null>(
    null
  );
  const [weakPasswords, setWeakPasswords] = useState<string[]>([]);
  const [duplicatePasswords, setDuplicatePasswords] = useState<string[]>([]);
  const [passwords, setPasswords] = useState<PasswordData[]>([]);

  useEffect(() => {
    // TODO: fetch data
  }, []);

  const checkEmailBreaches = async (email: string) => {
    try {
      const response = await axios.get<BreachCheckResponse>(
        `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(
          email
        )}`
      );

      if (response.data.breaches && response.data.breaches.length > 0) {
        console.log(response.data.breaches);
        setEmailBreaches(response.data.breaches[0]);
      } else {
        setEmailBreaches([]);
      }
    } catch (error) {
      console.error("Error checking email breaches:", error);
      setEmailBreaches([]);
    }
  };

  const checkPasswordBreach = async () => {
    try {
      const sha1Password = await sha1(password);
      const prefix = sha1Password.substring(0, 5);
      const suffix = sha1Password.substring(5);

      const response = await fetch(
        `https://api.pwnedpasswords.com/range/${prefix}`
      );
      const data = await response.text();
      const hashSuffixes = data.split("\n");
      const breached = hashSuffixes.some((line) =>
        line.startsWith(suffix.toUpperCase())
      );

      setPasswordBreached(breached);
    } catch (error) {
      console.error("Error checking password breach:", error);
    }
  };

  const checkWeakPasswords = () => {
    // TODO
  };

  const checkDuplicatePasswords = () => {
    // TODO
  };

  // Helper function to calculate SHA-1 hash
  async function sha1(str: string) {
    const buffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-1", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-9">Security Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Email Breach Detection</CardTitle>
            <CardDescription>
              Check if your email has been involved in any known breaches.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                className="bg-blue-600 hover:bg-blue-400 text-white"
                onClick={() => checkEmailBreaches(email)}
              >
                Check
              </Button>
            </div>
            {emailBreaches.length > 0 ? (
              <Alert className="mt-4" variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Email Breach Detected</AlertTitle>
                <AlertDescription>
                  Your email was found in {emailBreaches.length} breach(es)
                </AlertDescription>
              </Alert>
            ) : emailBreaches.length === 0 && email ? (
              <Alert className="mt-4" variant="default">
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>No Breaches Found</AlertTitle>
                <AlertDescription>
                  Your email was not found in any known breaches.
                </AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password Breach Detection</CardTitle>
            <CardDescription>
              Check if your password has been compromised.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <div className="relative flex-grow">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                className="bg-blue-600 hover:bg-blue-500 text-white"
                onClick={checkPasswordBreach}
              >
                Check
              </Button>
            </div>
            {passwordBreached !== null && (
              <Alert
                className="mt-4"
                variant={passwordBreached ? "destructive" : "default"}
              >
                {passwordBreached ? (
                  <>
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Password Breach Detected</AlertTitle>
                    <AlertDescription>
                      This password has been found in known data breaches.
                      Please change it immediately.
                    </AlertDescription>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <AlertTitle>Password Secure</AlertTitle>
                    <AlertDescription>
                      This password was not found in known breaches.
                    </AlertDescription>
                  </>
                )}
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weak Password Detection</CardTitle>
            <CardDescription>
              Assess the strength of your passwords.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="bg-blue-600 hover:bg-blue-500 text-white"
              onClick={checkWeakPasswords}
            >
              Analyze Passwords
            </Button>
            {weakPasswords.length > 0 ? (
              <Alert className="mt-4" variant="destructive">
                <Unlock className="h-4 w-4" />
                <AlertTitle>Weak Passwords Detected</AlertTitle>
                <AlertDescription>
                  {weakPasswords.length} of your passwords are considered weak.
                </AlertDescription>
              </Alert>
            ) : passwords.length > 0 && weakPasswords.length === 0 ? (
              <Alert className="mt-4" variant="default">
                <Lock className="h-4 w-4" />
                <AlertTitle>All Passwords Are Strong</AlertTitle>
                <AlertDescription>
                  All of your passwords meet the strength criteria.
                </AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Duplicate Password Detection</CardTitle>
            <CardDescription>
              Check for passwords used across multiple accounts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="bg-blue-600 hover:bg-blue-500 text-white"
              onClick={checkDuplicatePasswords}
            >
              Check for Duplicates
            </Button>
            {duplicatePasswords.length > 0 ? (
              <Alert className="mt-4" variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Duplicate Passwords Detected</AlertTitle>
                <AlertDescription>
                  {duplicatePasswords.length} of your passwords are used
                  multiple times.
                </AlertDescription>
              </Alert>
            ) : passwords.length > 0 && duplicatePasswords.length === 0 ? (
              <Alert className="mt-4" variant="default">
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>No Duplicate Passwords</AlertTitle>
                <AlertDescription>
                  Each of your passwords is unique across accounts.
                </AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SecurityDashboard;
