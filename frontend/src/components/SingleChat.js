import React, { useEffect } from 'react'
import { ChatState } from '../Context/ChatProvider';
import { socket } from '../socket';
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import { ArrowBackIcon, ArrowRightIcon } from '@chakra-ui/icons';
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
    const [Istyping, setIstyping] = useState(false);
    const toast = useToast();
    const [PreviousChatId, setPreviousChatId] = useState("")

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

      StatusUpdate();
    }

    const StatusUpdate = async () => {
      if (!SelectedChat) return;
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${User.token}`,
          },
        };
        const { data } = await axios.put(
          "http://localhost:5000/message/readressage",
          {
            chatId: SelectedChat,
          },
          config
        );
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to Update Status",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }

    const SendMessage = async () => {
      try {
				setTyping(false);
				socket.emit("stop typing", SelectedChat._id);
				const config = {
					headers: {
						"Content-type": "application/json",
						Authorization: `Bearer ${User.token}`,
					},
				};
				const { data } = await axios.post(
					"http://localhost:5000/message",
					{
						content: NewMessage,
						chatId: SelectedChat,
					},
					config
				);
				setNewMessage("");
				setMessages([...Messages, data]);
				socket.emit("new message", data);
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

    const handleKeyDown = async (event) => {
			if (event.key === "Enter") {
				if (event.shiftKey) {
					setNewMessage((prev) => prev + "\n"); 
				} else {
					if (NewMessage) {
						SendMessage();
					}
				}
			}
		};


    const handleSendMessage = async () => {
    if (NewMessage) {
      await SendMessage();
    }
  };

    const TypingHandler = (message) => {

      if(!SocketConnected) return;

      setNewMessage(message)
      setTyping(true);
      socket.emit("typing",SelectedChat._id);

      let lastTypingTime = new Date().getTime();
      var timerLength = 3000;
      setTimeout(() => {
        var timeNow = new Date().getTime();
        var timeDiff = timeNow - lastTypingTime;
        if (timeDiff >= timerLength && Typing) {
          socket.emit("stop typing", SelectedChat._id);
          setTyping(false);
        }
    }, timerLength);

    }


    useEffect(() => {
    socket.emit("setup", User);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIstyping(true));
    socket.on("stop typing", () => setIstyping(false));
    return () => {
      socket.off("connected", () => setSocketConnected(false))
    };
    }, [User])

    
    useEffect(() => {
      FetchMessages();
      if (SelectedChat && SelectedChat._id !== PreviousChatId) {
        socket.emit("join chat", SelectedChat._id);
      }

      if (PreviousChatId) {
        socket.emit("leave chat", PreviousChatId);
      }

      setPreviousChatId(SelectedChat ? SelectedChat._id : null);

      return () => {
        if (SelectedChat) {
          socket.emit("leave chat", SelectedChat._id);
        }
      };
    }, [SelectedChat] );

    useEffect(() => {
      
      socket.on("message recieved", (newMessageRecieved) => {
        if ( !SelectedChat || SelectedChat._id !== newMessageRecieved.chat._id ) {
          return;
        } else {
          StatusUpdate();
          setMessages([...Messages, newMessageRecieved]);
        }
      });
    })
  
    
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
								<ProfileModal user={getSenderFull(User, SelectedChat.users)} />
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
						<FormControl
							onKeyDown={handleKeyDown}
							id="first-name"
							isRequired
							mt={3}
						>
							{Istyping ? <div>loading...</div> : <></>}
							<Box
                display="flex"
              >
								<Input
									variant="filled"
									bg="#E0E0E0"
									placeholder="Enter a message.."
									value={NewMessage}
									onChange={(e) => TypingHandler(e.target.value)}
								/>
								<IconButton
									icon={<ArrowRightIcon />}
									onClick={handleSendMessage}
									ml={2}
								/>
							</Box>
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
	);
};


export default SingleChat