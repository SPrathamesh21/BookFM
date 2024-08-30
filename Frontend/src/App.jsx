import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from './User/Pages/Home'
import Header from './User/Components/Header'

function App() {
  
  return (
    <>
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/header' element={<Header />} />
    </Routes>
    </>
  )
}


function AppWrapper(){
  return (
    <Router>
      <App />
    </Router>
  )
}
export default AppWrapper
