import React from 'react'
import { useForm } from '../../hooks/useForm'
import { Global } from '../../helpers/Global';
import { useState } from 'react';

export const Register = () => {

    const { form, changed } = useForm({});
    const [ saved, setSaved] = useState("not_sended");

    const saveUser = async(e) => {
       //Prevenir actualización de pantalla
        e.preventDefault();

        // Obtener datos del formulario
        let newUser = form;

        // Guardar usuario en el backend
        const request = await fetch(Global.url + "user/register", {
            method: "POST",
            body: JSON.stringify(newUser),
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await request.json();

        if(data.status == "success"){
            setSaved("saved");
        }else{
            setSaved("error");
        }


    } //Finaliza del metodo guardar

    return(
        <>

            <header className="content__header content__header--public">
                <h1 className="content__title">Registrate</h1>
            </header>

            <div className="content__posts">

                {saved == "saved" ? 
                <span className="alert alert-success">Usuario registrado correctamente</span>
                : ''}

                {saved == "error" ?
                <span className="alert alert-danger">El usuario no ha sido registrado</span>
                : ''}

                <form className="register-form" onSubmit={saveUser}>

                    <div className="form-group">
                        <label htmlFor="name">Nombre</label>
                        <input type="text" name="name" onChange={changed} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Nombre de usuario</label>
                        <input type="text" name="username" onChange={changed} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input type="email" name="email" onChange={changed} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input type="password" name="password" onChange={changed} />
                    </div>

                    <input type="submit" value="Registrate" className='btn btn-sucess'/>

                </form>
            </div>

        </>
    )
}