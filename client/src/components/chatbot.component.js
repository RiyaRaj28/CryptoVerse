import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [chatHistory, setChatHistory] = useState([]); // To store chat history

  useEffect(() => {
    const checkLoggedIn = async () => {
      if (localStorage.getItem('jwt')) {
        try {
          await axios({
            method: 'get',
            url: 'http://localhost:5000/api/users/isAuthenticated',
            headers: {
              Authorization: localStorage.getItem('jwt'),
            },
          });
        } catch (err) {
          localStorage.removeItem('jwt');
          window.location = '/';
        }
      } else {
        window.location = '/';
      }
    };
    checkLoggedIn();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'http://localhost:5000/api/protected/chatbot/chatbot',
        { query },
        {
          headers: {
            Authorization: localStorage.getItem('jwt'),
          },
        }
      );
      setResponse(res.data.data.answer);
      setChatHistory([...chatHistory, { user: query, bot: res.data.data.answer }]);
      setQuery(''); // Clear the input field
    } catch (error) {
      console.error('Error interacting with chatbot:', error);
      setResponse('Error fetching response from chatbot.');
    }
  };

  return (
    <div style={styles.chatbotContainer}>
      <div style={styles.chatWindow}>
        {chatHistory.length > 0 ? (
          chatHistory.map((chat, index) => (
            <div key={index} style={styles.messageContainer}>
              <div style={styles.userMessage}>
                <p>{chat.user}</p>
              </div>
              <div style={styles.botMessage}>
                <p>{chat.bot}</p>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.messagePlaceholder}>
            <h3>Fire your Crypto Doubts!</h3>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type your message..."
          style={styles.input}
        />
        <button type="submit" style={styles.submitButton}>
          Send
        </button>
      </form>
    </div>
  );
};
const styles = {
  chatbotContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    height: '80vh', // Slightly reduced height for better visual impact
    width: '50%', // Limit to 50% of the screen width
    margin: '40px auto', // Center it horizontally and add some margin at the top
    backgroundColor: '#1a1a1a', // A bit lighter background for the chatbot container
    color: '#fff',
    fontFamily: 'Arial, sans-serif',
    borderRadius: '12px', // Rounded corners for a modern look
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)', // Shadow effect to make it stand out
    animation: 'fadeIn 1s ease-in-out', // Fade-in animation on load
  },
  chatWindow: {
    flexGrow: 1,
    padding: '20px',
    overflowY: 'hidden', // Hide the vertical scrollbar
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '60px', // Space for the input field
  },
  messageContainer: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '80%',
    margin: '0 auto',
    animation: 'slideIn 0.5s ease-out', // Slide-in animation for new messages
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1e90ff',
    color: '#fff',
    borderRadius: '12px',
    padding: '10px 15px',
    marginBottom: '10px',
    wordWrap: 'break-word',
    animation: 'slideInFromRight 0.5s ease-out', // Slide in from the right
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2d2d2d',
    color: '#fff',
    borderRadius: '12px',
    padding: '10px 15px',
    wordWrap: 'break-word',
    animation: 'slideInFromLeft 0.5s ease-out', // Slide in from the left
  },
  messagePlaceholder: {
    textAlign: 'center',
    color: '#888',
    marginTop: '20px',
  },
  form: {
    display: 'flex',
    padding: '10px',
    backgroundColor: '#1e1e1e',
    position: 'fixed',
    bottom: 0,
    left: '25%', // Offset the form to align with the container
    width: '50%', // Match the container width
    borderTop: '1px solid #333',
    borderBottomLeftRadius: '12px', // Rounded corners to match the container
    borderBottomRightRadius: '12px', // Rounded corners to match the container
  },
  input: {
    flexGrow: 1,
    backgroundColor: '#333',
    border: 'none',
    borderRadius: '8px',
    padding: '15px',
    color: '#fff',
    marginRight: '10px',
    fontSize: '1em',
    outline: 'none',
  },
  submitButton: {
    backgroundColor: '#ffa500',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 15px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1em',
    transition: 'background 0.3s ease',
    animation: 'buttonHover 0.3s ease-in-out', // Animation for hover effect
  },
};

// Add keyframes for animations
const globalStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideInFromRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes slideInFromLeft {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes buttonHover {
    0% { background-color: #ffa500; }
    50% { background-color: #ff8c00; }
    100% { background-color: #ffa500; }
  }
`;

// Append global styles to the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = globalStyles;
document.head.appendChild(styleSheet);



export default Chatbot;