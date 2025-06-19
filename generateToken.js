const jwt = require('jsonwebtoken');

const JWT_SECRET = 'alsfi1010';  // Same as used in server

// You can change "Usama" to any name you want as the user
const token = jwt.sign({user:'usamaIrshad'}, JWT_SECRET);

console.log('Your JWT token:\n');
console.log(token);
