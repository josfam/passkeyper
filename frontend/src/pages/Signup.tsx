import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import axios from "axios";
import { Input } from "../components/ui/input";
import { FaGoogle } from "react-icons/fa";

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

  /**
   * Handles the Google Signup when the google sign up is clicked
   */
  const handleGoogleSignUp = () => {
    window.location.href = "http://localhost:5000/google";
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
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
                  className={`${emailError ? 'border border-red-700' : ''}`}
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
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
              <div className="flex flex-col gap-1">
                <Input
                  type="password"
                  placeholder="Master Password"
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
                  className={`${hasStrengthInfo ? 'border border-red-700' : ''}`}
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
            <button type="submit" className={`btn-primary  w-full mt-4
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
            <hr className="my-5"/>
            <button className="btn-primary btn-secondary w-full flex gap-3"
              onClick={handleGoogleSignUp}
            >
              <FaGoogle/>
              Sign up with Google
            </button>
         
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Login
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
