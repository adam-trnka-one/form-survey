import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './components/admin/AdminDashboard';
import PreviewForm from './components/preview/PreviewForm';
import Layout from './components/layout/Layout';
import EditForm from './components/admin/EditForm';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/edit/:formId" element={<EditForm />} />
        <Route path="/preview/:formId" element={<PreviewForm />} />
      </Route>
    </Routes>
  );
}

export default App;
