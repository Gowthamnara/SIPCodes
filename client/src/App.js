import React, { useState } from 'react';
import { BrowserRouter, Route,Routes, useParams } from 'react-router-dom';
import GetSipCodes from './Components/GetSipCodes';


function App() {
  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path='/convid/:convid' element={<GetSipCodes/>} ></Route>
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
