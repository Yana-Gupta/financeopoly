// src/components/Layout.jsx
import React, { useEffect } from "react"
import { useDispatch } from "react-redux"
import Navbar from "./components/Navbar"
import { fetchPlayerById } from "./redux/authSlice"
import { Outlet } from "react-router-dom"
import "./App.css"

const Layout = ({ children }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    console.log("Hello")
    dispatch(fetchPlayerById())
  }, [dispatch])

  return (
    <div className="layout w-full h-screen flex flex-col">
      {/* Navbar */}
      <div className="h-28 w-full bg-orange-400">
        <Navbar />
      </div>

      <div className="w-full flex-grow">
        <Outlet />
      </div>
    </div>
  )
}

export default Layout
