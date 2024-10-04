import React from 'react';

function Login() {
  const handleGitHubLogin = () => {
    // Redirect to the backend route that initiates GitHub OAuth
    window.location.href = '/auth/github';
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form>
        {/* Existing username/password login form */}
        <div>
          <label>Username</label>
          <input type="text" placeholder="Username" />
        </div>
        <div>
          <label>Password</label>
          <input type="password" placeholder="Password" />
        </div>
        <button type="submit">Login</button>
      </form>

      <hr />

      {/* Add GitHub OAuth login button */}
      <button onClick={handleGitHubLogin} className="github-login-button">
        Continue with GitHub
      </button>

      <p>Don't have an account? <a href="/register">Register</a></p>
    </div>
  );
}

export default Login;
