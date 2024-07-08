import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Global } from "../../helpers/Global";
import { UserList } from "../user/UserList";

export const Following = () => {
  
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(true);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  const params = useParams();

  useEffect(() => {
    getUsers(1);
  }, []);

  const getUsers = async (nextPage = 1) => {
    //Efecto de carga
    setLoading(true);

    //Sacar userId de la url
    const userId = params.userId;

    // Petición para sacar usuarios
    const request = await fetch(Global.url + 'follow/following/' + userId + "/" + nextPage, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": localStorage.getItem("token"),
      },
    });

    const data = await request.json();

    let cleanUsers = [];

    //Recorrer y limpiar follos y dejar los seguidos
    data.follows.forEach(follow => {
        cleanUsers = [...cleanUsers, follow.followed]
    });
    data.users = cleanUsers;

    console.log(data.users);

    //Crear un estado para poder listarlos
    if (data.users && data.status == "success") {
      let newUsers = data.users;

      if (users.length >= 1) {
        newUsers = [...users, ...data.users];
      }

      setUsers(newUsers);
      setFollowing(data.user_following);
      setLoading(false);

      //Paginación
      //comprobamos si quedan más usuarios por mostrar sino ocultamso el botón
      if (users.length >= data.total - data.users.length) {
        setMore(false);
      }
    }
  };

  return (
    <>
      <header className="content__header">
        <h1 className="content__title">Siguiendo</h1>
      </header>

      <UserList users={users} 
                getUsers={getUsers}
                following={following}
                setFollowing={setFollowing}
                page={page}
                setPage={setPage}
                more={more}
                loading={loading}
      />
    </>
  );
};