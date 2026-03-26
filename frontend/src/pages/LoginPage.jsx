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

export default function LoginPage() {
  const auth = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await auth.login({ email, password });
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          Login
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 3 }}>
          Welcome back. Create posts, like, and comment.
        </Typography>

        <Box component="form" onSubmit={onSubmit}>
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
            {submitting ? "Logging in..." : "Login"}
          </Button>

          <Typography sx={{ mt: 2 }}>
            Don&apos;t have an account?{" "}
            <RouterLink to="/signup" style={{ color: "#1976d2" }}>
              Sign up
            </RouterLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

