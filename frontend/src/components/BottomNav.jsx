import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import AddBoxIcon from "@mui/icons-material/AddBox";
import PersonIcon from "@mui/icons-material/Person";
import { AuthContext } from "../context/AuthContext.jsx";

export default function BottomNav({ value, onChange, onCreate }) {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <Paper
      sx={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
      }}
      elevation={4}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(e, newValue) => {
          onChange?.(newValue);
          if (newValue === 1) onCreate?.();
          if (newValue === 2) {
            if (auth?.isAuthed) navigate("/social");
            else navigate("/login");
          }
        }}
      >
        <BottomNavigationAction label="Social" value={0} icon={<ChatBubbleIcon />} />
        <BottomNavigationAction label="Post" value={1} icon={<AddBoxIcon />} />
        <BottomNavigationAction
          label={auth?.isAuthed ? "Account" : "Login"}
          value={2}
          icon={<PersonIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
}

