import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Input } from "../components/ui/input";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { MIN_MASTERPASSWORD_SCORE } from "../utils/passwords/Constants";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import checkWeakPassword from "../utils/passwords/stengthCheck";

const API_URL = import.meta.env.VITE_FLASK_APP_API_URL;

const ExternalAuthPasswordPage: React.FC = () => {
  // email and username state
  const [email, setEmail] = useState<string | null>('');
  const [username, setUsername] = useState<string | null>('');
  // password state
  const [passwordIsTyped, setPasswordIsTyped] = useState(false);
  const [confirmationIsTyped, setConfirmationIsTyped] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmationPassword, setConfirmationPassword] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [hasStrengthInfo, setHasStrengthInfo] = useState(false)
  const [strengthMessage, setStrengthMessage] = useState("");
  const [passwordsDontMatch, setPasswordsDontMatch] = useState(false);
  // general state
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // fetch the email and username from the url parameters
  const location = useLocation();


  // error if any info is missing
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const userInfoParams = params.get('user_info');
    if (!userInfoParams) {
      setError('There was something wrong with the Google SignUp')
      return;
    }
    console.log(`userInfoParams: `, userInfoParams); // DEBUG
    // decode the url params into json
    try {
      // replace every single quote with a double quote (required for json)
      const userInfo = JSON.parse(decodeURIComponent(userInfoParams.replace(/'/g, '"')))
      console.log(userInfo.email); // DEBUG
      console.log(userInfo.username); // DEBUG
      setEmail(userInfo.email);
      setUsername(userInfo.username);
    } catch (error) {
      console.log(error); // DEBUG
    }
    // console.log(`Email: `, params.get('email')); // DEBUG
    // console.log(`Username: `, params.get('username')); // DEBUG
    // setEmail(userInfo.get('email'));
    // setUsername(userInfo.get('username'));
  }, [location.search])

  const navigate = useNavigate();

  const checkPasswordMatching = useCallback((confirmationPassword: string) => {
    console.log(`Password:`, password); // DEBUG
    console.log(`Confirmation:`, confirmationPassword); // DEBUG
    if (password === '') return;
    if (confirmationPassword !== password) {
      setPasswordsDontMatch(true)
      return
    }
    setPasswordsDontMatch(false)
  }, [password])

  useEffect(() => {
    checkPasswordMatching(confirmationPassword);
  }, [checkPasswordMatching, confirmationPassword])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

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
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-lg text-center text-slate-500">Complete your Google Sign Up</CardTitle>
        </CardHeader>
        <hr className="hrule-heading"/>
        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Input
                  type="password"
                  placeholder="Enter a Master Password"
                  value={password}
                  required
                  disabled={isLoading}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setHasStrengthInfo(false);
                      setPasswordIsTyped(false);
                      setPassword(value);
                    } else {
                      setPasswordIsTyped(true);
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

                {/* master password confirmation */}
                <Input
                  type="password"
                  placeholder="Confirm Master Password"
                  value={confirmationPassword}
                  required
                  disabled={isLoading}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setConfirmationIsTyped(false)
                      setConfirmationPassword(value);
                    } else {
                      setConfirmationIsTyped(true);
                      setConfirmationPassword(value);
                      checkPasswordMatching(value);
                    }
                  }}
                  className={`${passwordsDontMatch && passwordIsTyped && confirmationIsTyped ? 'border border-red-700' : ''}`}
                />
                {/* error messages if any */}
                <p className="text-red-700 text-sm text-center">{
                  passwordsDontMatch && passwordIsTyped && confirmationIsTyped ? `Passwords don't match` : ''}
                </p>
              </div>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <button type="submit" className={`btn-primary  w-full mt-6
              ${(isLoading || passwordsDontMatch || password === '') ? 'btn-disabled' : ''}`}
              style={{
                pointerEvents: isLoading || passwordsDontMatch ? 'none' : 'auto'
              }}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing your Sign Up...
                </>
              ) : (
                "Complete your Google Sign Up"
              )}
            </button>
          </form>
          <hr className="mt-5" />
        </CardContent>
        <CardFooter>
          <p className="text-base text-center w-full">
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

export default ExternalAuthPasswordPage;
