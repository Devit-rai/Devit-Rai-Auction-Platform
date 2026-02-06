const roleBasedAuth =(roles) => {
    return (req, res, next) => {  
        if (req.user.roles.includes(roles)) return next();

        res.status(403).json({ message: "Forbidden: You don't have permission to access this resource" });
}
}
export default roleBasedAuth; 