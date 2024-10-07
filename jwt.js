const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req,res,next)=>{
  //First check request headers are authorized or not

  const authorization = req.headers.authorization;
  if(!authorization) return res.status(401).json({error:'Token not found'});

  //Extracting the jwt token from the request header
  const token = req.headers.authorization.split(' ')[1];
  if(!token) return res.status(401).json({error:'Unauthorized'});
  try {
    //Verifying the jwt token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //Attach The user information  to the request Object  
    req.user = decoded;
    console.log(req.user)
    next();
    
  } catch (error) {
    console.log(error);
    return res.status(401).json({error:'Invalid Token'});
    
  }
}

//Function to generate jwt token

const generateToken = (userData) => {
  //Generate a new JWT token using user data 
  return jwt.sign(userData,process.env.JWT_SECRET,{expiresIn:30000});

}

module.exports= {jwtAuthMiddleware,generateToken};