import axios from "axios";

const fUrl = 'https://australia-southeast1-palo-hospital.cloudfunctions.net';
// const fUrl = 'http://localhost:5001/palo-hospital/australia-southeast1';

/**
 * Get illnesses from firebsae API.
 * 
 * @returns Promise - A promise of json data that contains illnesses.
 */
export const getIllness = () => {
  return axios.get(`${fUrl}/illnesses`);
}

/**
 * Search and filter hospital based on the severity.
 * 
 * @returns Promise - A promise of json data that contains search result.
 */
export const searchHospital = (severity) => {
  return axios.get(`${fUrl}/searchHospital?severity=${severity}`);
}

/**
 * Add into firebase firestore to store as a booking record.
 * 
 * @param {Object} bookingDetails - Patients details and selected hospital
 * @returns 
 */
export const createBooking = (bookingDetails) => {
  return axios.post(`${fUrl}/booking`, bookingDetails);
  // return fetch(, {
  //   method: 'POST',
  //   mode: 'cors', // no-cors, *cors, same-origin
  //   cache: 'no-cache',
  //   credentials: 'same-origin',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   redirect: 'follow',
  //   referrerPolicy: 'no-referrer',
  //   body: JSON.stringify(bookingDetails) // body data type must match "Content-Type" header
  // }).then(response => response.json());
}