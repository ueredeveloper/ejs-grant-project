import logo from './logo.svg';
import './App.css';
import { sendMessage, receiveMessage } from './server';

function App() {

  function _sendMessage (){
    sendMessage()
  }
  function _receiveMessage (){
    receiveMessage()
  }

  return (
    <div>
      <button onClick={_sendMessage}>Send Message</button>
      <button onClick={_receiveMessage}>Receive Message</button>
    </div>
  );
}

export default App;
