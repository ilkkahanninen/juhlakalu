import AccountIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import React, { useCallback, useState } from "react";
import { logout } from "../api/api";
import { useAppState, userL } from "../state/AppState";
import { ignoreDispatch } from "../state/useStore";
import { LoginDrawer } from "./drawers/login/LoginDrawer";
import { SignupDrawer } from "./drawers/signup/SignupDrawer";

export type MainAppBarProps = {
  title: string;
};

export const MainAppBar = (props: MainAppBarProps) => {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const hideLogin = useCallback(() => {
    setLoginOpen(false);
  }, []);

  const [isSignupOpen, setSignupOpen] = useState(false);
  const hideSignup = useCallback(() => {
    setSignupOpen(false);
  }, []);

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            id="appbar_title"
            variant="h6"
            component="div"
            sx={{ flexGrow: 1 }}
          >
            {props.title}
          </Typography>
          <AuthButtons
            onSetLoginOpen={setLoginOpen}
            onSetSignupOpen={setSignupOpen}
          />
        </Toolbar>
      </AppBar>
      <LoginDrawer open={isLoginOpen} onClose={hideLogin} />
      <SignupDrawer open={isSignupOpen} onClose={hideSignup} />
    </>
  );
};

type AuthButtonsProps = {
  onSetLoginOpen: (visible: boolean) => void;
  onSetSignupOpen: (visible: boolean) => void;
};

const AuthButtons = (props: AuthButtonsProps) => {
  const { state, dispatchTaskEither } = useAppState();

  const showLogin = useCallback(() => {
    props.onSetLoginOpen(true);
  }, [props]);

  const showSignup = useCallback(() => {
    props.onSetSignupOpen(true);
  }, [props]);

  // Account menu

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const openMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const closeMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const logoutUser = useCallback(() => {
    closeMenu();
    dispatchTaskEither(logout(), ignoreDispatch, userL.set);
  }, [closeMenu, dispatchTaskEither]);

  return state.user ? (
    <>
      <Button
        id="appbar_account"
        color="inherit"
        onClick={openMenu}
        endIcon={<AccountIcon />}
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
      >
        <span id="appbar_username">{state.user.username}</span>
      </Button>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
      >
        <MenuItem id="appbar_logout" onClick={logoutUser}>
          Log out
        </MenuItem>
      </Menu>
    </>
  ) : (
    <ButtonGroup variant="text" color="inherit" aria-label="login button group">
      <Button id="appbar_login" color="inherit" onClick={showLogin}>
        Login
      </Button>
      <Button id="appbar_signup" color="inherit" onClick={showSignup}>
        Sign up
      </Button>
    </ButtonGroup>
  );
};
