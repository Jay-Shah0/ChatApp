import { Box } from "@chakra-ui/layout";
import { useState } from "react";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";
import ChatBox from "../components/ChatBox";

const Chatpage = () => {
  const { User } = ChatState();

  const [FetchAgain, setFetchAgain] = useState(false);
  return (
    <div style={{ width: "100%" }}>
      {User && <SideDrawer />}
      <Box display="flex" justifyContent="space-between" w="100%" h="91.5vh" p="10px">
        {User && <MyChats fetchAgain={FetchAgain} />}
        {User && (
          <ChatBox fetchAgain={FetchAgain} setfetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
};

export default Chatpage;
