import React, { useState } from "react";
import axios from "axios";
import "./App.scss";
import { ArrowUpRight, Search } from "react-feather";

const App = () => {
  const apiKey = "AIzaSyAxG4vk1rsGz9pmRX6FfD7-8t5kFOoTCbw";
  const [query, setQuery] = useState([]);
  const [message, setMessage] = useState("");

  const fetchResponse = async (text, index) => {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: text,
                },
              ],
            },
          ],
        }
      );

      const responseText = response.data.candidates[0]?.content?.parts[0]?.text || "No response";
      const formattedResponse = formatResponse(responseText);

      setQuery((prevQueries) => {
        const updatedQueries = [...prevQueries];
        updatedQueries[index] = {
          ...updatedQueries[index],
          response: formattedResponse,
        };
        return updatedQueries;
      });
    } catch (error) {
      console.log(error);
      setQuery((prevQueries) => {
        const updatedQueries = [...prevQueries];
        updatedQueries[index] = {
          ...updatedQueries[index],
          response: error.response?.data?.error?.message === "Resource has been exhausted (e.g. check quota)."
            ? "Limit exhausted"
            : "Error occurred",
        };
        return updatedQueries;
      });
    }
    
    
  };

  const formatResponse = (text) => {
    const lines = text.split('\n');
    const formattedLines = lines.map(line => {
      if (line.startsWith('* ')) {
        return `<li>${line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`;
      }
      return line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    });
    const listHTML = formattedLines.includes('<li>') ? `<ul>${formattedLines.join('\n')}</ul>` : formattedLines.join('<br />');
    return listHTML;
  };
  

  const handleSubmit = (event) => {
    event.preventDefault();
    if (message.trim()) {
      setQuery((prevQueries) => {
        const newIndex = prevQueries.length;
        const newQueries = [
          ...prevQueries,
          { query: message, response: "Loading..." }
        ];

        fetchResponse(message, newIndex);

        return newQueries;
      });
      setMessage("");
    }
  };

  return (
    <div className="homepage">
      {query.length>0 ? (<div className="output">
        {query.map((q, index) => (
          <div className="query" key={index}>
            <p className="input">{q.query}</p>
            <p className="response" dangerouslySetInnerHTML={{ __html: q.response }}></p>
          </div>
        ))}
      </div> ): (<div className="intro">
        <h1>Start Conversation</h1>
        <p>Enter your prompt below</p>
      </div>)
}
      <form className="searchbox" onSubmit={handleSubmit}>
        <Search className="search" />
        <input 
          type="text" 
          placeholder="Enter prompt" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">
          <ArrowUpRight />
        </button>
      </form>
      <div className="credits">
        made by <a href="https://github.com/prince-vishwakarma-cs" target="blank">prince vishwakarma</a>
      </div>
    </div>
  );
};

export default App;
