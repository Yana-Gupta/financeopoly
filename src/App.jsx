// src/components/Layout.jsx
import React, { useEffect } from "react"
import { useDispatch } from "react-redux"
import Navbar from "./components/Navbar"
import { fetchPlayerById } from "./redux/authSlice"
import { Outlet } from "react-router-dom"

const Layout = ({ children }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    console.log("Hello")
    dispatch(fetchPlayerById())
  }, [dispatch])

  return (
    <div className="layout">
      {/* Navbar */}
      <div className="w-full">
        <Navbar />
      </div>

      <div className="w-full h-[80vh]">
        <Outlet />
      </div>

      {/* Footer (optional, you can customize it further) */}

      <footer>
        <p>© 2024 My Game App</p>
      </footer>
    </div>
  )
}

export default Layout
