import React, { useRef, useEffect, useState, use } from "react";

function StreamComponent({ getDevices, setEndSubmit }) {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8000/stream"); // Connect to your FastAPI SSE endpoint
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, data]);
        // debugger;
        if (data.data.trim() === 'Sniffer finished current running') {
            // debugger;
            // setMessages((prevMessages) => [...prevMessages, { data: `Press 'Stop' button to continue !!!` }]);
            setEndSubmit(false);
            // eventSource.close();
        }
        if (data.data.trim() in ['AI Agent processing completed', 'Packets Agent processing completed']) {
            // setMessages((prevMessages) => [...prevMessages, { data: `AI Agent processing completed: ${data.details}` }]);
            // debugger;
            getDevices();
        }
        // scrollToBottom();
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      eventSource.close();
    };
    
    // Clean up the EventSource connection when the component unmounts
    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return ( 
    <div>
      <label htmlFor="console">Console:</label>
      <div id='console' style={{ fontSize: "0.8rem", color: "lightblue", border: "2px solid lightblue", height: "10rem", width: "20rem", overflowY: "scroll" }}>
        {messages.map((msg, index) => (
          <p key={index} style={{ color: "yellow" }}>{msg.data}</p>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default StreamComponent;