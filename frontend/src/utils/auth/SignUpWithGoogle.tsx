const RedirectToGoogleAccounts = () => {
  try {
    window.location.href = "http://localhost:5000/google"
  } catch (error) {
    console.log(`Google login failed:`, error); //DEBUG
  }
}

export default RedirectToGoogleAccounts;
