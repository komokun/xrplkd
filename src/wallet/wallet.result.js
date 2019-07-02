/**
 * Result wraps the executed output in a promise. 
 * This helps allow for a standard interface to wallet consumers.
 * 
 * @param {*} result 
 * @param {*} data 
 * @param {*} message 
 */
export const Result = (result, data, message) => {

   return new Promise((resolve, reject) => {
      
      resolve({result: result , data: data, message: message});
   });
};