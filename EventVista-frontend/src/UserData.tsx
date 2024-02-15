import React, {useState, useEffect} from "react";
import ReactDOM from "react-dom";

const Endpoint = "http://127.0.0.1:5000/api/get_data"

const ApiCall = async () => {
    const response = await fetch(Endpoint);
    const jsonResponse = await response.json();
    console.log(jsonResponse);
    return JSON.stringify(jsonResponse)
}

export function RenderResult() {
    const [apiResponse, setApiResponse] = useState("*** now loading ***");
  
    useEffect(() => {
        ApiCall().then(
            result => setApiResponse(result));
    },[]);
  
    return(
        <div>
            <h1>React App</h1>
            <p>{apiResponse}</p>
        </div>
    );
  };
  
  ReactDOM.render(
      <RenderResult/>,
      document.querySelector('#root')
  );
