import { Box } from "@chakra-ui/layout";
import { useEffect, useState } from "react";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";
import ChatBox from "../components/ChatBox";
import axios from "axios";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { toast } from "@chakra-ui/react";

const Chatpage = () => {
  const { User } = ChatState();
  const history = useHistory

  const authcheck = async () => {
    try {
			const config = {
				headers: {
					Authorization: `Bearer ${User.token}`,
				},
			};
			const { data } = await axios.get("http://localhost:5000/user/auth", config);

			if(!data.auth){
        localStorage.removeItem("UserInfo");
				history.push("/");
      }
		} catch (error) {
      toast({
				title: "Error Occured!",
				description: "Failed Auth the user",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom-left",
			});
			console.log(error);
      localStorage.removeItem("UserInfo");
			history.push("/");
    }

  }
  useEffect(() => {

  }, [])

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
