import React from 'react'
import { useState } from 'react'
import { useForm } from '../../hooks/useForm';
import { Global } from '../../helpers/Global';
import useAuth from '../../hooks/useAuth';


export const Login = () => {

    const { form, changed } = useForm({});
    const[saved, setSaved] = useState("not_sended");

    const {setAuth} = useAuth();

    const loginUser = async(e) => {
        e.preventDefault();

        // Datos del formulario
        let userToLogin = form;

        //Petición al backend
        const request = await fetch(Global.url+ 'user/login', {
            method: "POST",
            body: JSON.stringify(userToLogin),
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await request.json();


        if(data.status == "success"){

            // los datos queden en el navegador
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            setSaved("login");

            // Setear datos en el auth
            setAuth(data.user);

            //Redirección
            setTimeout(() => {
                window.location.reload();
            }, 1000);


        }else{
            setSaved("error");
        }
    }

    return(
        <>

            <header className="content__header content__header--public">
                <h1 className="content__title">Iniciar sesión</h1>
            </header>

            <div className="content__posts">

                {saved == "login" ? 
                <span className="alert alert-success">Usuario identificado correctamente</span>
                : ''}

                {saved == "error" ?
                <span className="alert alert-danger">El usuario no ha sido identificado</span>
                : ''}


                <form className='form-login' onSubmit={loginUser}>
                    <div className='form-group'>
                        <label htmlFor="email">Correo electrónico</label>
                        <input type="email" name ="email" onChange={changed} />
                    </div>

                    <div className='form-group'>
                        <label htmlFor="password">Contraseña</label>
                        <input type="password" name ="password" onChange={changed} />
                    </div>

                    <input type="submit" value="Iniciar sesión" className="btn btn-success" />
                </form>
            </div>

        </>
    )
}