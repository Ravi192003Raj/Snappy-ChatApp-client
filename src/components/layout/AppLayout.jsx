import { Drawer, Grid, Skeleton } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  NEW_MESSAGE_ALERT,
  NEW_REQUEST,
  ONLINE_USERS,
  REFETCH_CHATS,
} from "../../constants/events";
import { useErrors, useSocketEvents } from "../../hooks/hook";
import { getOrSaveFromStorage } from "../../lib/features";
import { useMyChatsQuery } from "../../redux/api/api";
import {
  incrementNotification,
  setNewMessagesAlert,
} from "../../redux/reducers/chat";
import {
  setIsDeleteMenu,
  setIsMobile,
  setSelectedDeleteChat,
} from "../../redux/reducers/misc";
import { getSocket } from "../../socket";
import DeleteChatMenu from "../dialogs/DeleteChatMenu";
import Title from "../shared/Title";
import ChatList from "../specific/ChatList";
import Profile from "../specific/Profile";
import Header from "./Header";

const AppLayout = () => (WrappedComponent) => {
  return (props) => {
    const params = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const socket = getSocket();

    const chatId = params.chatId;
    const deleteMenuAnchor = useRef(null);

    const [onlineUsers, setOnlineUsers] = useState([]);

    const { isMobile } = useSelector((state) => state.misc);
    const { user } = useSelector((state) => state.auth);
    const { newMessagesAlert } = useSelector((state) => state.chat);

    const { isLoading, data, isError, error, refetch } = useMyChatsQuery("");

    useErrors([{ isError, error }]);

    useEffect(() => {
      getOrSaveFromStorage({ key: NEW_MESSAGE_ALERT, value: newMessagesAlert });
    }, [newMessagesAlert]);

    const handleDeleteChat = (e, chatId, groupChat) => {
      dispatch(setIsDeleteMenu(true));
      dispatch(setSelectedDeleteChat({ chatId, groupChat }));
      deleteMenuAnchor.current = e.currentTarget;
    };

    const handleMobileClose = () => dispatch(setIsMobile(false));

    const newMessageAlertListener = useCallback(
      (data) => {
        if (data.chatId === chatId) return;
        dispatch(setNewMessagesAlert(data));
      },
      [chatId]
    );

    const newRequestListener = useCallback(() => {
      dispatch(incrementNotification());
    }, [dispatch]);

    const refetchListener = useCallback(() => {
      refetch();
      navigate("/");
    }, [refetch, navigate]);

    const onlineUsersListener = useCallback((data) => {
      setOnlineUsers(data);
    }, []);

    const eventHandlers = {
      [NEW_MESSAGE_ALERT]: newMessageAlertListener,
      [NEW_REQUEST]: newRequestListener,
      [REFETCH_CHATS]: refetchListener,
      [ONLINE_USERS]: onlineUsersListener,
    };

    useSocketEvents(socket, eventHandlers);

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh", // Ensure it takes the full height of the viewport
          backgroundImage: `url('/background Img.jpg')`,
          backgroundSize: "cover", // Ensure the background image covers the whole area
      backgroundPosition: "center", // Center the background image
          padding: "1rem", // Ensure the shadow and border radius are not cut off
        }}>
        <div
          id="first"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            borderRadius: "15px",
            overflow: "hidden",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)", // Add box shadow for visibility
            backgroundColor: "#fff", // Background color for the content area
            maxWidth: "1200px",
            width: "100%",
            height: "auto", // Make sure it adjusts to its content
          }}>
          <Title />
          <div style={{ width: "100%" }}>
            <Header />

            <DeleteChatMenu
              dispatch={dispatch}
              deleteMenuAnchor={deleteMenuAnchor}
            />

            {isLoading ? (
              <Skeleton />
            ) : (
              <Drawer open={isMobile} onClose={handleMobileClose}>
                <ChatList
                  w="70vw"
                  chats={data?.chats}
                  chatId={chatId}
                  handleDeleteChat={handleDeleteChat}
                  newMessagesAlert={newMessagesAlert}
                  onlineUsers={onlineUsers}
                />
              </Drawer>
            )}
            <Grid container style={{ height: "80vh", width: "100%" }}>
            <Grid
              item
              sm={4}
              md={3}
              sx={{
                display: { xs: "none", sm: "block" },
                height: "100%",
                overflowY: "auto",
                "&::-webkit-scrollbar": {
                  width: "0.5rem", // Sets the width of the scrollbar
                },
                "&::-webkit-scrollbar-track": {
                  background: "#f1f1f1", // Optional: changes the track color
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#888", // Scrollbar color
                  borderRadius: "20px", // Optional: rounds the corners of the scrollbar thumb
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background: "#555", // Changes color when hovering over the scrollbar
                },
              }}>
              {isLoading ? (
                <Skeleton />
              ) : (
                <ChatList
                  chats={data?.chats}
                  chatId={chatId}
                  handleDeleteChat={handleDeleteChat}
                  newMessagesAlert={newMessagesAlert}
                  onlineUsers={onlineUsers}
                />
              )}
            </Grid>
            <Grid item xs={12} sm={8} md={5} lg={6} height={"100%"}>
              <WrappedComponent {...props} chatId={chatId} user={user} />
            </Grid>
            <Grid
              item
              lg={3}
              md={4}
              sx={{
                display: { xs: "none", md: "block" },
                padding: "2rem",
                bgcolor: "rgba(0,0,0,0.85)",
              }}>
              <Profile user={user} />
            </Grid>
            </Grid>
          </div>
        </div>
      </div>
    );
  };
};

export default AppLayout;
