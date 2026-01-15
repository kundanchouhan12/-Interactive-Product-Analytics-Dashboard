import { useState } from "react";
import api from "../api";

export default function Login({ onLogin }){
    const [username,setUsername]=useState("");
    const [password,setPassword]=useState("");

    const handleLogin=async()=>{
        const res = await api.post("/auth/login",{username,password});
        localStorage.setItem("token",res.data.token);
        localStorage.setItem("userId",res.data.userId);
        onLogin();
    }

    return <>
        <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button onClick={handleLogin}>Login</button>
    </>
}
