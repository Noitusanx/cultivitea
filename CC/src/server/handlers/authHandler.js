const { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    sendEmailVerification,
    sendPasswordResetEmail,
   } = require('../../config/firebase');
   const { saveUserData } = require('../../services/storeData');
   const {getAuth} = require('../../config/firebase');
   const auth = getAuth();

// Auth handler
async function signUp(req, res) {
    const { username, email, password } = req.body;
    if (!email || !password || !username) {
        return res.status(422).json({
        username: "Username is required",
        email: "Email is required",
        password: "Password is required"
        });
    }
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userData = {
        username: username,
        uid: user.uid,
        email: user.email,
        phoneNumber: "",
        dateOfBirth: "",
        imageUrl: "", 
        };
    
        await saveUserData(userData);
        await sendEmailVerification(user);
        res.status(201).json({ message: "Verification email sent! User created successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error saving user data or sending email verification" });
    }
    }
    
    async function signIn(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(422).json({
            email: "Email is required",
            password: "Password is required",
        });
    }
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => { 
            const idToken = userCredential._tokenResponse.idToken
            if (idToken) {
                res.cookie('access_token', idToken, {
                    httpOnly: true
                });
                res.status(200).json({ message: "User logged in successfully", userCredential });
            } else {
                res.status(500).json({ error: "Internal Server Error" });
            }
        })
        .catch((error) => {
            console.error(error);
            const errorMessage = error.message || "An error occurred while logging in";
            res.status(500).json({ error: errorMessage });
        });
    }
    
    async function logOut(req, res) {
        signOut(auth)
            .then(() => {
            res.clearCookie('access_token');
            res.status(200).json({ message: "User logged out successfully" });
            })
            .catch((error) => {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
            });
        }
    
    async function resetPassword(req, res){
      const { email } = req.body;
      if (!email ) {
        return res.status(422).json({
          email: "Email is required"
        });
      }
      sendPasswordResetEmail(auth, email)
        .then(() => {
          res.status(200).json({ message: "Password reset email sent successfully!" });
        })
        .catch((error) => {
          console.error(error);
          res.status(500).json({ error: "Internal Server Error" });
        });
    }
  

    module.exports = {signUp, signIn, logOut, resetPassword};