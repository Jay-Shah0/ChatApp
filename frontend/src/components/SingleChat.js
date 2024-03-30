import React, { useEffect } from 'react'
import { ChatState } from '../Context/ChatProvider';
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender, getSenderFull } from '../config/ChatLogics';
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import { useState } from 'react';
import ScrollableChat from './MessagesScroll';
import axios from 'axios';

const SingleChat = ( { fetchAgain, setfetchAgain } ) => {

    const { SelectedChat,setSelectedChat,User } = ChatState();

    const [Messages, setMessages] = useState([]);
    const [loading, setloading] = useState(true);
    const [NewMessage, setNewMessage] = useState("");
    const [SocketConnected, setSocketConnected] = useState(false);
    const [Typing, setTyping] = useState(false);
    const [istyping, setistyping] = useState(false);
    const toast = useToast();

    const Endpoint = "http://localhost:5000";

    const FetchMessages = async () => {
      if (!SelectedChat) return;

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${User.token}`,
          },
        };

        setloading(true);

        const { data } = await axios.get(
          `http://localhost:5000/message/${SelectedChat._id}`,
          config
        );
        setMessages(data);
        setloading(false); 
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to Load the Messages",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }

    const SendMessage = async (event) => {
      if (event.key === "Enter" && NewMessage) {
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${User.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "http://localhost:5000/message",
          {
            content: NewMessage,
            chatId: SelectedChat,
          },
          config
        );
        setMessages([...Messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
    }
    const TypingHandler = (message) => {
      setNewMessage(message)
      //Sending Message so pop in reciever chat   
    }

    useEffect(() => {
      FetchMessages();
    }, [SelectedChat] );
    
  return (
      <>
        {SelectedChat ? (
            <>
              <Text
              fontSize={{ base: "28px", md: "30px" }}
              pb={3}
              px={2}
              w="100%"
              fontFamily="Work sans"
              display="flex"
              justifyContent={{ base: "space-between" }}
              alignItems="center"
              >
                <IconButton
                icon={<ArrowBackIcon />}
                onClick={() => setSelectedChat("")}
                />
                {!SelectedChat.isGroupChat ? (
                <>
                  {getSender(User, SelectedChat.users)}
                  <ProfileModal
                  user={getSenderFull(User, SelectedChat.users)}
                  />
                </>
              ) : (
                <>
                  {SelectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchAgain={fetchAgain}
                    setfetchAgain={setfetchAgain}
                  />
                </>
              )}
              </Text>
              <Box
                display="flex"
                flexDir="column"
                justifyContent="flex-end"
                p={3}
                bg="#E8E8E8"
                w="100%"
                h="100%"
                borderRadius="lg"
                overflowY="hidden"
              >
                {loading ? (
                <Spinner
                  size="xl"
                  w={20}
                  h={20}
                  alignSelf="center"
                  margin="auto"
                />
              ) : (
                <div className="messages">
                  <ScrollableChat Messages={Messages} />
                </div>
                )}
                <FormControl onKeyDown={SendMessage} id="first-name" isRequired mt={3}>
                {istyping ? (
                  <div>
                  </div>
                  ) : (
                    <></>
                  )}
                  <Input
                    variant="filled"
                    bg="#E0E0E0"
                    placeholder="Enter a message.."
                    value={NewMessage}
                    onChange={(e) => TypingHandler(e.target.value)}
                  />
                </FormControl>
              </Box>

            </>
        ) : (
            <Box>
                <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                    Click on User to start Chating
                </Text>
            </Box>
        )}

      </>
  )
};


export default SingleChat