//Here is the flow of frontend to backend connection--->
//On clicking any button, we will actually call some function present in the services folder
//That function in the services folder will call any controller present in backend..i.e..the request will finally land on a controller
//Then we will call any function written inside that controller which will return the final response
//So the flow is----->

// Frontend->Components->Buttons->Services->Controllers->final response

import axios from "axios";

//Creating an instance
export const axiosInstance = axios.create({})

//This template function is used to call controller from backend
//We have to call the funcion with proper parameter 
//So method(get,put,post) and url are given
export const apiConnector = (method, url, bodyData, headers, params) => {
    return axiosInstance({
        method: `${method}`,
        url: `${url}`,
        data: bodyData ? bodyData : null,
        headers: headers ? headers : null,
        params: params ? params : null,
    })
}