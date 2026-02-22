
import './App.css'
import './index.css'
import HomePage from './pages/Homepage';

function App() {
  
  return (
    <>
      <Routes>
          <Route element={<RootLayout />}>
            <Route path="/home" element={<HomePage />} />

          </Route>
        </Routes>
    </>
  )
}

export default App
