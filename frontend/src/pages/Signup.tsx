import React, { useState, useEffect, useCallback} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../components/ui/button";
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

const API_URL = import.meta.env.VITE_FLASK_APP_API_URL;

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [strengthMessage, setStrengthMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [passwordInputFocused, setPasswordInputFocused] = useState(false);
  const hasStrengthInfo = strengthMessage || warningMessage
  const errorInCredentials = !(password && username && email && !hasStrengthInfo);
  const navigate = useNavigate();

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

  const checkStrength = useCallback((masterPassword: string) => {
	const report = checkWeakPassword({masterPassword: masterPassword});
	console.log(report);
	const [score, suggestion, warning] = [
		report.score,
		report.feedback.suggestions[0],
		report.feedback.warning,]
	if (score <= MIN_MASTERPASSWORD_SCORE) {
		setWarningMessage(warning || '')
		setStrengthMessage(suggestion)
		return;
	}
  }, []);

  useEffect(() => {
	checkStrength(password);
  }, [checkStrength, password]);

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
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
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
					onChange={(e) => setPassword(e.target.value)}
					required
					disabled={isLoading}
					className={`${(hasStrengthInfo && passwordInputFocused) ? 'border border-red-700': ''}`}
					// onFocus={}
					onInput={() => setPasswordInputFocused(true)}
				/>
				{/* error messages if any */}
				<p className="text-red-700 text-sm text-center">{
				passwordInputFocused ? (warningMessage || strengthMessage) : ''}</p>
			  </div>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full mt-4" disabled={isLoading || errorInCredentials}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing Up...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
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
