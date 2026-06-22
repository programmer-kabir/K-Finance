import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"

const MainLayout = () => {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-4 bg-[#0B1220]">
        <Outlet />
      </div>
    </div>
  )
}

export default MainLayout