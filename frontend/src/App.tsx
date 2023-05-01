import React from 'react';
import logo from './logo.svg';
import './App.css';
import { observer } from 'mobx-react-lite';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/home/home.page';
import RegisterPage from './pages/register/register.page';
import LoginPage from './pages/login/login.page';
import WeaponsPage from './pages/weapons/weapons.page';
import AchievementsPage from './pages/achievements/achievements.page';
import ArmorPage from './pages/armor/armor.page';
import AbilityPage from './pages/ability/ability.page';

const App = observer(() => {

  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/weapons" element={<WeaponsPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/armors" element={<ArmorPage />} />
        <Route path="/abilities" element={<AbilityPage />} />
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
