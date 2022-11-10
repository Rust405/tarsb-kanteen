 //check domain
 const email = user.email
 const emailDomain = email.substring(email.indexOf('@') + 1)

 var role
 if (emailDomain === 'student.tarc.edu.my' || emailDomain === 'tarc.edu.my') {
   role = 'customer'
 } else {
   role = 'stallOwner'
 }




 const q = query(collection(db, "users"), where("uid", "==", user.uid))
 const docs = await getDocs(q)
 if (docs.docs.length === 0) {
   await addDoc(collection(db, "users"), {
     uid: user.uid
   })
 }