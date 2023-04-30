import React from 'react';
import logo from './logo.svg';
import './App.css';
import { observer } from 'mobx-react-lite';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/home/home.page';
import RegisterPage from './pages/register/register.page';
import LoginPage from './pages/login/login.page';

const App = observer(() => {

  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/apartments" element={<ApartmentsPage />} />
        <Route path="/addresses" element={<AdressesPage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/contracts" element={<RentPage />} />
        <Route path="/payrent" element={<PayRentPage />} /> */}
      </Routes>
  );
})

export default App;
