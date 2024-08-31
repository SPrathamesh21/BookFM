// axiosConfig.js (or wherever your Axios instance is configured)
import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5454',
    withCredentials: true, // Include credentials
});

export default instance;
