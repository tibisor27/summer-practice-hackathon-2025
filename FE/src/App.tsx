import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'
import { Dashboard } from './pages/Dashboard'
import { CreateProject } from './pages/CreateProject'
import { ProjectDetails } from './pages/ProjectDetails'

function App() {
  return <BrowserRouter>
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/signin" element={<Signin />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/create-project" element={<CreateProject />} />
    <Route path="/project/:projectId" element={<ProjectDetails />} />
  </Routes>
</BrowserRouter>
}


export default App
