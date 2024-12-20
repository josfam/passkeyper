import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import axios from "axios";
import { Input } from "../components/ui/input";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { MIN_MASTERPASSWORD_SCORE } from "../utils/passwords/Constants";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import checkWeakPassword from "../utils/passwords/stengthCheck";
import AuthWithGoogleBtn from "../components/buttons/AuthWithGoogleBtn";

const API_URL = import.meta.env.VITE_FLASK_APP_API_URL;

const Signup: React.FC = () => {
  // email state 
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState('');
  const [emailTyped, setEmailTyped] = useState(false);
  // password state
  const [password, setPassword] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [hasStrengthInfo, setHasStrengthInfo] = useState(false)
  const [strengthMessage, setStrengthMessage] = useState("");
  // username state
  const [username, setUsername] = useState("");
  // general state
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const emailSchema = z.string().email({
    message: "Enter a valid email address"
  })  // email validation schema
  const navigate = useNavigate();

  const handleEmailValidation = useCallback((emailAddress: string) => {
    if (!emailTyped) return;

    // validate the email
    const emailValidation = emailSchema.safeParse(emailAddress);
    if (!emailValidation.success) {
      setEmailError(emailValidation.error.issues[0].message)
      return;
    } else {
      setEmailError('');
    }
  }, [emailSchema, emailTyped])

  useEffect(() => {
    handleEmailValidation(email)
  }, [handleEmailValidation, email])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setEmailError('');

    const ekSalt =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    try {
      const response = await axios.post(
        `${API_URL}/signup`,
        {
          email,
          password,
          username,
          ek_salt: ekSalt,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 201) {
        navigate("/login");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error || "An error occurred during signup"
        );
      } else {
        setError("An unexpected error occurred");
      }
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // check the strength of the master password provided at signup
  const checkStrength = useCallback((masterPassword: string) => {
    const report = checkWeakPassword({ masterPassword: masterPassword });
    const [score, suggestion, warning] = [
      report.score,
      report.feedback.suggestions[0],
      report.feedback.warning,]
    if (score < MIN_MASTERPASSWORD_SCORE) {
      setWarningMessage(warning || '')
      setStrengthMessage(suggestion)
      if (password) setHasStrengthInfo(true);
      return;
    } else {
      setHasStrengthInfo(false);
    }
  }, [password]);
  // re-check strength  on state change
  useEffect(() => {
    checkStrength(password);
  }, [checkStrength, password]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-96 shadow-lg shadow-indigo-200 border border-slate-200">
        <CardHeader className="bg-slate-200 rounded-t-lg py-4 mb-10">
          <CardTitle className="text-center text-lg text-slate-600">Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  autoFocus
                  className={`h-11 text-lg border-2 border-indigo-200
                    ${emailError ? 'border border-red-700' : ''}`}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setEmail(value);
                      setEmailError('');
                      setEmailTyped(false)
                    } else {
                      setEmail(value);
                      setEmailTyped(true);
                      handleEmailValidation(email);
                    }
                  }
                  }
                  required
                  disabled={isLoading}
                />
                {/* error messages if any */}
                {emailError && (
                  <p className="text-red-700 text-sm text-center">
                    {emailError}
                  </p>
                )}
              </div>
              <Input
                type="text"
                placeholder="Enter username"
                value={username}
                className="h-11 text-lg border-2 border-indigo-200"
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
              <div className="flex flex-col gap-1">
                <Input
                  type="password"
                  placeholder="Enter master password"
                  value={password}
                  required
                  disabled={isLoading}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setHasStrengthInfo(false);
                      setPassword(value);
                    } else {
                      setPassword(value);
                      checkStrength(password);
                    }
                  }}
                  className={`h-11 text-lg border-2 border-indigo-200
                    ${hasStrengthInfo ? 'border border-red-700' : ''}`}
                />
                {/* error messages if any */}
                <p className="text-red-700 text-sm text-center">{
                  hasStrengthInfo ? (warningMessage || strengthMessage) : ''}
                </p>
              </div>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <button type="submit" className={`btn-primary  w-full mt-8
              ${(isLoading || hasStrengthInfo || !username || !email || !password) ? 'btn-disabled' : ''}`}
              style={{
                pointerEvents :  isLoading || hasStrengthInfo || !username || !email || !password ? 'none' : 'auto'
              }}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing Up...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
            </form>
            <div className="flex items-center gap-2 my-3">
              <div className="h-[1px] w-full bg-slate-300"></div>
              or
              <div className="h-[1px] w-full bg-slate-300"></div>
            </div>
            <AuthWithGoogleBtn action={'Sign Up'}/>
         
        </CardContent>
        <CardFooter className="flex flex-col justify-center">
          <p className="text-lg text-gray-400">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 text-lg hover:underline">
              Login
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
