import './App.css'
import Navbar from "./components/Navbar"

import { Provider } from 'react-redux'
import Store from "./redux/store.js"

function App() {

  return (
    <Provider store={Store}>
      <div className='w-full'>
        <Navbar />
      </div>
      <div>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Error nobis voluptatem deleniti repudiandae debitis ut earum nostrum, maxime dolorem quas? Vel perferendis ipsa, hic laborum explicabo cumque libero. Praesentium, nihil.
      </div>
    </Provider>
  )
}

export default App
