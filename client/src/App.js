import { useEffect, useState } from "react";
import ListHeader from "./components/ListHeader";
import ListItem from "./components/ListItem";
import Auth from "./components/Auth";
import { useCookies } from "react-cookie";

const App = () => {
  const [cookies, setCookie, removeCookie] = useCookies(null);
  const authToken = cookies.AuthToken;
  const userEmail = cookies.Email;
  const [tasks, setTasks] = useState([]);

  const getData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/todos/${userEmail}`);
      console.log(response);
      const json = await response.json();
      console.log(json);
      setTasks(json);
      console.log(tasks);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (authToken) {
      getData();
    }
  }, []);

  // sort by date
  const sortedTasks = tasks?.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <div className="app">
      {!authToken && <Auth />}
      {authToken && (
        <>
          <ListHeader listName={"Holiday Tick List"} getData={getData} />
          <p className="user-email">Welcome back {userEmail}</p>
          {sortedTasks.map((task, index) => {
            return <ListItem task={task} key={task.id} getData={getData} />;
          })}
        </>
      )}
      <p className="copyright">Creative Coding LLC</p>
    </div>
  );
};

export default App;
