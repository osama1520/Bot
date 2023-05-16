const axios = require('axios');

const options = {
 method: 'GET',
 url: 'https://cricket-live-data.p.rapidapi.com/fixtures',
 headers: {
 'X-RapidAPI-Key': '68d311e3b9msh20e352d32afc996p1e1f32jsne53a016bc0e7',
 'X-RapidAPI-Host': 'cricket-live-data.p.rapidapi.com'
 }
};

async function getData() {
 try {
 const response = await axios.request(options);
 console.log(response.data);
 } catch (error) {
 console.error(error);
 }
}

getData();
