import { useContext, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { AuthContext } from "../context/AuthContext.jsx";

export default function SignupPage() {
  const auth = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await auth.signup({ username, email, password });
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          Create account
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 3 }}>
          Start posting and join the feed.
        </Typography>

        <Box component="form" onSubmit={onSubmit}>
          <TextField
            fullWidth
            label="Username"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            type="password"
            label="Password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error ? (
            <Typography sx={{ color: "error.main", mt: 1 }}>{error}</Typography>
          ) : null}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, borderRadius: 2 }}
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Sign up"}
          </Button>

          <Typography sx={{ mt: 2 }}>
            Already have an account?{" "}
            <RouterLink to="/login" style={{ color: "#1976d2" }}>
              Login
            </RouterLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

