import {HttpStatusCode} from "axios";

export default class Response {
    constructor(response = null, error = null, status = HttpStatusCode.Ok) {
        this.error = error;
        this.response = response;
        this.statusCode = status;
    }
}