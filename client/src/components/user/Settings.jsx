import React, { useState } from "react";
import useAuth from "../../hooks/useAuth";
import { Global } from "../../helpers/Global";
import { SerializeForm } from "../../helpers/SerializeForm";

export const Settings = () => {
  const { auth, setAuth } = useAuth();

  const [saved, setSaved] = useState("not_saved");

  const updateUser = async (e) => {
    e.preventDefault();

    //Token de autenticación para evitar hacer dos llamadas al localstorage
    const token = localStorage.getItem("token");

    //Tomamos datos del formulario
    let newDataUser = SerializeForm(e.target);

    //Borrar propiedad innecesaria
    delete newDataUser.file0;

    //Actualizar usuario en la base de datos
    const request = await fetch(Global.url + "user/update", {
      method: "PUT",
      body: JSON.stringify(newDataUser),
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });
    const data = await request.json();

    if (data.status == "success" && data.user) {
      delete data.user.password;

      setAuth(data.user);
      setSaved("saved");

    } else {
      setSaved("error");
    }

    //Subir imagenes
    const fileInput = document.querySelector("#file");

    if (data.status == "success" && fileInput.files[0]) {
      // Obtenemod la imagen que vamos a subir
      const formData = new FormData();
      formData.append("file0", fileInput.files[0]);

      //Petición para enviar la imagen al back y guarde
      const uploadRequest = await fetch(Global.url + "user/upload", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: token,
        },
      });
      const uploadData = await uploadRequest.json();

      if (uploadData.status == "success" && uploadData.user) {
        delete uploadData.user.password;

        setAuth(uploadData.user);
        setSaved("saved");
      } else {
        setSaved("error");
      }
    }
  };

  return (
    <>
      <header className="content__header content__header--public">
        <h1 className="content__title">Ajustes</h1>
      </header>

      <div className="content__posts">
        {saved == "saved" ? (
          <span className="alert alert-success">
            Usuario actualizado correctamente
          </span>
        ) : (
          ""
        )}

        {saved == "error" ? (
          <span className="alert alert-danger">
            El usuario no ha sido actualizado
          </span>
        ) : (
          ""
        )}

        <form className="config-form" onSubmit={updateUser}>
          <div className="form-group">
            <label htmlFor="name">Nombre</label>
            <input type="text" name="name" defaultValue={auth.name} />
          </div>

          <div className="form-group">
            <label htmlFor="username">Nombre de usuario</label>
            <input type="text" name="username" defaultValue={auth.username} />
          </div>

          <div className="form-group">
            <label htmlFor="occupation">Área de Trabajo o Actividad</label>
            <textarea name="occupation" defaultValue={auth.occupation} />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input type="email" name="email" defaultValue={auth.email} />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input type="password" name="password" />
          </div>

          <div className="form-group">
            <label htmlFor="file0">Foto de perfil</label>
            <div className="avatar">
              <div className="general-info__container-avatar">
                {auth.image != "default.png" && (
                  <img
                    src={Global.url + "user/avatar/" + auth.image}
                    className="container-avatar__img"
                    alt="Foto de perfil"
                  />
                )}
                {auth.image == "default.png" && (
                  <img
                    src={avatar}
                    className="container-avatar__img"
                    alt="Foto de perfil"
                  />
                )}
              </div>
            </div>
            <input type="file" name="file0" id="file" />
          </div>

          <input
            type="submit"
            value="Actualizar perfil"
            className="btn btn-sucess"
          />
        </form>
      </div>
    </>
  );
};
