export const getRole = (email) => {
    const emailDomain = email.substring(email.indexOf('@') + 1)
    return (emailDomain === 'student.tarc.edu.my' || emailDomain === 'tarc.edu.my') ? 'customer' : 'stallUser'
}