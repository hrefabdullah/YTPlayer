class ApiResponse {
    constructor(statusCode, data, message) {
        this.statusCode = statusCode
        this.data = data
        this.message = message || ApiResponse.defaultMessage(statusCode)
        this.success = statusCode < 400
    }

    static defaultMessage(code) {
        if (code >= 200 && code < 300) return "Success";
        if (code >= 400 && code < 500) return "Client Error";
        if (code >= 500) return "Server Error";
        return "Unknown";
    }
}

export { ApiResponse }