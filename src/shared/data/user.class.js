import userRoles from "@/shared/data/user.roles.js";
export default class user {
    constructor(
        id = null,
        name = "",
        lastname = "",
        username = '',
        email = '',
        role = userRoles.patient,
        sex = 0,
        createdAt = new Date(),
        updatedAt = new Date(),
    ) {
        this.id = id;
        this.name = name;
        this.lastname = lastname;
        this.username = username;
        this.email = email;
        this.role = role;
        this.sex = sex;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}