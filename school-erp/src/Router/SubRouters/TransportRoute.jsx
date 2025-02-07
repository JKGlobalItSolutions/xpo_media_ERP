import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BusVanFee from '../../pages/Transport Pages/BusVanFee';
import PlaceSetup from '../../pages/Transport Pages/PlaceSetup';
import BusFeeSetup from '../../pages/Transport Pages/BusFeeSetup';
import BusVanBill from '../../pages/Transport Pages/NewBusBill';
import DayBusFee from '../../pages/Transport Pages/DayBusFee';
import NewBusBill from '../../pages/Transport Pages/NewBusBill';
import PeriodBusCollection from '../../pages/Transport Pages/PeriodBusCollection';
import BusBalanceReport from '../../pages/Transport Pages/BusBalanceReport';

function TransportRoute() {
  return (
    <Routes>
      <Route path="bus-van-fee" element={< BusVanFee/>} />    
      <Route path="place-setup" element={< PlaceSetup/>} />    
      <Route path="bus-fee-setup" element={< BusFeeSetup/>} />    
      <Route path="new-bus-bill" element={< NewBusBill/>} />    
      <Route path="day-bus-fee" element={< DayBusFee/>} />    
      <Route path="period-bus-collection" element={< PeriodBusCollection/>} />    
      <Route path="bus-balance-report" element={< BusBalanceReport/>} />    
    </Routes>
  );
}

export default TransportRoute;